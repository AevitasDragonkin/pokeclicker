import { Observable, ObservableArray, PureComputed } from 'knockout';
import { BattleTreeBattle, BattleTreeBattleWinner } from './BattleTreeBattle';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { BattleTreePokemon } from './BattleTreePokemon';
import { BattleTreeController } from './BattleTreeController';
import Rand from '../utilities/Rand';
import Settings from '../settings';
import { BattleTreeModifier, BattleTreeModifierEffectTarget } from './BattleTreeModifier';
import { BattleTreeModifiers } from './BattleTreeModifiers';
import { Currency, SHINY_CHANCE_BATTLE } from '../GameConstants';
import { pokemonMap } from '../pokemons/PokemonList';
import GameHelper from '../GameHelper';
import { BattleTreeRewards, BattleTreeRewardType } from './BattleTreeRewards';

export enum BattleTreeRunState {
    TEAM_SELECTION,
    BATTLE,
    REWARD,
    MODIFIER,
    FINISHED,
}

export class BattleTreeRun {
    public readonly uuid: string;
    private _seed: Observable<number>;
    private _stage: Observable<number>;
    private _state: Observable<BattleTreeRunState>;

    private _battle: Observable<BattleTreeBattle | null>;
    private _runTimer: Observable<number>;
    private _combatTimer: Observable<number>;

    private _teamA: ObservableArray<BattleTreePokemon>;
    private _teamB: ObservableArray<BattleTreePokemon>;

    public longListSelection: PureComputed<PokemonNameType[]> = ko.pureComputed(() => {
        return BattleTreeController.getLongListTeamSelection(this._seed(), BattleTreeController.calculateLongListSelectionSize());
    });

    constructor(uuid?: string) {
        this.uuid = uuid ?? crypto.randomUUID();
        this._seed = ko.observable(BattleTreeController.calculateSeed());
        this._stage = ko.observable(0);
        this._state = ko.observable(BattleTreeRunState.TEAM_SELECTION);

        this._battle = ko.observable(null);
        this._runTimer = ko.observable(0);
        this._combatTimer = ko.observable(0);

        this._teamA = ko.observableArray();
        this._teamB = ko.observableArray();
    }

    public update(delta: number): void {
        this.updateTimers(delta);

        if (this.state === BattleTreeRunState.BATTLE) {
            this._battle()?.update(delta);

            if (this._battle()?.isFinished) {
                const teamACanContinue: boolean = this._teamA().some(p => p.HP > 0);
                const teamBCanContinue: boolean = this._teamB().some(p => p.HP > 0);

                if (this._battle().winner === BattleTreeBattleWinner.PLAYER_A || this._battle().winner === BattleTreeBattleWinner.DRAW) {
                    BattleTreeRun.handlePokemonDefeat(this._battle().pokemonB);

                    const pokemonTypeA = pokemonMap[this._battle().pokemonB.name].type[0];
                    const pokemonTypeB = pokemonMap[this._battle().pokemonB.name].type[1] ?? pokemonTypeA;

                    BattleTreeRewards.addReward(this.uuid, { type: BattleTreeRewardType.Gem, gemType: pokemonTypeA, amount: ko.observable(5) });
                    BattleTreeRewards.addReward(this.uuid, { type: BattleTreeRewardType.Gem, gemType: pokemonTypeB, amount: ko.observable(5) });
                }

                if (teamACanContinue && teamBCanContinue) {
                    // Start a new battle
                    this.createBattle(
                        this._battle()?.pokemonA.HP > 0 ? this._battle()?.pokemonA.name : this._teamA().find(p => p.HP > 0).name,
                        this._teamB().find(p => p.HP > 0).name,
                    );
                } else if (this._battle().winner === BattleTreeBattleWinner.PLAYER_A) {
                    GameHelper.incrementObservable(App.game.statistics.battleTreeTotalStagesCompleted, 1);
                    App.game.statistics.battleTreeHighestStageCompleted(Math.max(this._stage(), App.game.statistics.battleTreeHighestStageCompleted()));
                    if (this.seed === BattleTreeController.calculateSeed()) {
                        App.game.statistics.battleTreeHighestDailyStageCompleted(Math.max(this._stage(), App.game.statistics.battleTreeHighestDailyStageCompleted()));
                    }

                    this.addStageReward();
                    this._state(BattleTreeRunState.REWARD);

                    if (this._stage() % 5 === 0 ) {
                        this._state(BattleTreeRunState.MODIFIER);

                        if (Settings.getSetting('autoSelectRandomModifier').observableValue()) {
                            // TODO : BT : Select a random modifier
                            const options = BattleTreeController.getModifierOptionsForStage(this.seed, this.uuid, this.stage, 3);
                            this.addModifier(Rand.fromArray(options).id);
                        }
                    } else {
                        this.nextStage();
                    }
                } else {
                    GameHelper.incrementObservable(App.game.statistics.battleTreeTotalRunsCompleted, 1);

                    this.addRunReward();
                    this._state(BattleTreeRunState.FINISHED);
                }
            }
        }
    }

    private updateTimers(delta: number): void {
        if (this.state === BattleTreeRunState.BATTLE) {
            this._combatTimer(this._combatTimer() + delta);
        }

        if (this.state !== BattleTreeRunState.FINISHED) {
            this._runTimer(this._runTimer() + delta);
        }
    }

    public createBattle(pokemonAName: PokemonNameType, pokemonBName: PokemonNameType, startBattleState: boolean = true) {
        const pokemonA: BattleTreePokemon = this._teamA().find((p: BattleTreePokemon) => p.name === pokemonAName);
        const pokemonB: BattleTreePokemon = this._teamB().find((p: BattleTreePokemon) => p.name === pokemonBName);

        if (pokemonA && pokemonB) {
            this._battle(new BattleTreeBattle({ runID: this.uuid, pokemonA, pokemonB }));

            if (startBattleState) {
                this._state(BattleTreeRunState.BATTLE);
            }
        }
    }

    public addModifier(modifierID: number) {
        const modifier = BattleTreeModifiers.addModifier(this.uuid, modifierID);

        modifier?.instantEffects.forEach(effect => effect(this));

        if (this.state === BattleTreeRunState.MODIFIER) {
            this.nextStage();
        }
    }

    public startRun(): void {
        this.nextStage();
    }

    public nextStage(): void {
        this._stage(this._stage() + 1);

        this._teamB(BattleTreeController
            .getRandomTeamForStage(this._seed(), this._stage(), 3)
            .map(pokemonName => new BattleTreePokemon({
                runID: this.uuid,
                name: pokemonName,
                level: BattleTreeController.calculatePokemonLevelForStage(this.stage),
                modifierTargetID: BattleTreeModifierEffectTarget.Enemy,
            })));
        this._teamB().forEach(p => {
            p.shiny = PokemonFactory.generateShiny(SHINY_CHANCE_BATTLE);
            p.gender = PokemonFactory.generateGenderById(pokemonMap[p.name].id);
        });

        this.createBattle(
            this._battle()?.pokemonA.HP > 0 ? this._battle()?.pokemonA.name : this._teamA().find(p => p.HP > 0).name,
            this._teamB().find(p => p.HP > 0).name,
        );
    }

    public emptyPlayerATeam(): void {
        this._teamA.removeAll();
    }

    public fillPlayerATeamRandomly(): void {
        this.emptyPlayerATeam();
        Rand.shuffleArray(this.longListSelection().filter(name => App.game.party.alreadyCaughtPokemonByName(name))).slice(0, 3).forEach(name => {
            this.addPokemonToPlayerATeam(name);
        });
    }

    public addPokemonToPlayerATeam(pokemon: PokemonNameType): void {
        if (this._teamA().length >= 3) return;
        if (this._teamA().findIndex(p => p.name === pokemon) >= 0) return;

        this._teamA.push(new BattleTreePokemon({
            runID: this.uuid,
            name: pokemon,
            level: BattleTreeController.calculatePokemonLevelForPlayer(pokemon),
            modifierTargetID: BattleTreeModifierEffectTarget.Player,
        }));
    }

    public removePokemonFromPlayerATeam(pokemon: PokemonNameType): void {
        this._teamA.remove(this._teamA().find(p => p.name === pokemon));
    }

    private addStageReward(): void {
        // TODO : BT : Give stage reward
        BattleTreeRewards.addReward(this.uuid, { type: BattleTreeRewardType.Currency, currency: Currency.money, amount: ko.observable(1000 * this._stage()) });
    }

    private addRunReward(): void {
        // TODO : BT : Give final reward
        BattleTreeRewards.addReward(this.uuid, { type: BattleTreeRewardType.Currency, currency: Currency.battlePoint, amount: ko.observable(1000) });
        BattleTreeRewards.addReward(this.uuid, { type: BattleTreeRewardType.Item, item: 'xAttack', amount: ko.observable(1) });
    }

    get seed(): number {
        return this._seed();
    }

    get stage(): number {
        return this._stage();
    }

    get state(): BattleTreeRunState {
        return this._state();
    }

    get teamA(): BattleTreePokemon[] {
        return this._teamA();
    }

    get teamB(): BattleTreePokemon[] {
        return this._teamB();
    }

    get battle(): BattleTreeBattle {
        return this._battle();
    }

    get modifiers(): BattleTreeModifier[] {
        return BattleTreeModifiers.getModifierList(this.uuid)();
    }

    get runTime(): number {
        return this._runTimer();
    }

    get combatTime(): number {
        return this._combatTimer();
    }

    toJSON(): Record<string, any> {
        return {
            uuid: this.uuid,
            seed: this._seed(),
            stage: this._stage(),
            state: this._state(),
            battle: this._battle()?.toJSON(),
            modifiers: BattleTreeModifiers.getModifierList(this.uuid)().map(modifier => modifier.id),
            rewards: ko.toJS(BattleTreeRewards.getRewardList(this.uuid)),
            runTime: this._runTimer(),
            combatTime: this._combatTimer(),
            teamA: this._teamA().map((p: BattleTreePokemon) => p.toJSON()),
            teamB: this._teamB().map((p: BattleTreePokemon) => p.toJSON()),
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreeRun {
        const run: BattleTreeRun = new BattleTreeRun(json.uuid ?? undefined);

        run._stage(json.stage ?? 0);
        run._seed(json.seed ?? 0);
        run._state(json.state ?? BattleTreeRunState.TEAM_SELECTION);

        json.modifiers?.forEach(id => BattleTreeModifiers.addModifier(run.uuid, id));
        json.rewards?.forEach(reward => BattleTreeRewards.addReward(run.uuid, { ...reward, amount: ko.observable(reward.amount) }));

        run._teamA(json.teamA?.map(p => BattleTreePokemon.fromJSON(p)) ?? []);
        run._teamB(json.teamB?.map(p => BattleTreePokemon.fromJSON(p)) ?? []);

        run._runTimer(json.runTime ?? 0);
        run._combatTimer(json.combatTime ?? 0);

        if (json.battle?.pokemonA && json.battle?.pokemonB) {
            run._battle(new BattleTreeBattle({
                runID: run.uuid,
                pokemonA: run.teamA.find(value => value.name === json.battle.pokemonA),
                pokemonB: run.teamB.find(value => value.name === json.battle.pokemonB),
                attackCounter: json.battle.attackCounter,
                attacker: json.battle.attacker,
            }));
        }

        return run;
    }

    public static handlePokemonDefeat(pokemon: BattleTreePokemon): void {
        // TODO : BT : Handle statistics and defeat rewards (gems, egg steps, xp...)
        BattleTreeController.addBattleTreeExp(pokemon.name, pokemon.level);
    }
}
