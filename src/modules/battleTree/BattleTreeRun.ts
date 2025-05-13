import { Observable, ObservableArray, PureComputed } from 'knockout';
import { BattleTreeBattle, BattleTreeBattleWinner } from './BattleTreeBattle';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { BattleTreePokemon } from './BattleTreePokemon';
import { BattleTreeController } from './BattleTreeController';
import Rand from '../utilities/Rand';
import Settings from '../settings';
import { BattleTreeModifier, BattleTreeModifierEffectTarget } from './BattleTreeModifier';
import { BattleTreeModifiers } from './BattleTreeModifiers';

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

    private _selectedPokemon: Observable<PokemonNameType | null>;

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

        this._selectedPokemon = ko.observable(null);
    }

    public update(delta: number): void {
        this.updateTimers(delta);

        if (this.state === BattleTreeRunState.BATTLE) {
            this._battle()?.update(delta);

            if (this._battle()?.isFinished) {
                const teamACanContinue: boolean = this._teamA().some(p => p.HP > 0);
                const teamBCanContinue: boolean = this._teamB().some(p => p.HP > 0);

                if (this._battle().winner === BattleTreeBattleWinner.PLAYER_A || this._battle().winner === BattleTreeBattleWinner.DRAW) {
                    BattleTreeController.addBattleTreeExp(this._battle().pokemonB.name, this._battle().pokemonB.level);
                }

                if (teamACanContinue && teamBCanContinue) {
                    // Set the selected pokemon to the current one if it still has HP, otherwise switch it to the first one with HP
                    this._selectedPokemon(this._teamA().find(p => p.name === this._selectedPokemon()).HP > 0 ? this._selectedPokemon() : this._teamA().find(p => p.HP > 0).name);

                    // Reset all attack counters
                    this._teamA().forEach(p => p.resetAttackCounter());
                    this._teamB().forEach(p => p.resetAttackCounter());

                    // Start a new battle
                    this.createBattle(this._selectedPokemon(), this._teamB().find(p => p.HP > 0).name);

                } else if (this._battle().winner === BattleTreeBattleWinner.PLAYER_A) {
                    // TODO : BT : Give stage reward
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
                    // TODO : BT : Give final reward
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

    public createBattle(pokemonAName: PokemonNameType, pokemonBName: PokemonNameType) {
        const pokemonA: BattleTreePokemon = this._teamA().find((p: BattleTreePokemon) => p.name === pokemonAName);
        const pokemonB: BattleTreePokemon = this._teamB().find((p: BattleTreePokemon) => p.name === pokemonBName);

        if (pokemonA && pokemonB) {
            this._battle(new BattleTreeBattle({ runID: this.uuid, pokemonA, pokemonB }));
            this._state(BattleTreeRunState.BATTLE);
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
        if (this._teamA().findIndex(p => p.name === this._selectedPokemon()) < 0) {
            this._selectedPokemon(this._teamA()[0].name);
        }
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
        this.createBattle(this._selectedPokemon(), this._teamB()[0].name);
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

    get selectedPokemon(): PokemonNameType | null {
        return this._selectedPokemon();
    }

    set selectedPokemon(pokemon: PokemonNameType) {
        if (this._selectedPokemon() === pokemon) {
            return;
        }

        this._selectedPokemon(pokemon);

        if (this.state === BattleTreeRunState.BATTLE) {
            // Reset all attack counter when a player switches his pokemon
            // Team B will not reset its attack counter
            this._teamA().forEach(p => p.resetAttackCounter());

            // Create a new battle with the selected pokemon and the first enemy in team B
            this.createBattle(this._selectedPokemon(), this._teamB().find(p => p.HP > 0).name);
        }
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
            battle: this._battle() ? {
                pokemonA: this._battle().pokemonA.name,
                pokemonB: this._battle().pokemonB.name,
            } : undefined,
            modifiers: BattleTreeModifiers.getModifierList(this.uuid)().map(modifier => modifier.id),
            runTime: this._runTimer(),
            combatTime: this._combatTimer(),
            teamA: this._teamA().map((p: BattleTreePokemon) => p.toJSON()),
            teamB: this._teamB().map((p: BattleTreePokemon) => p.toJSON()),
            selectedPokemon: this._selectedPokemon(),
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreeRun {
        const run: BattleTreeRun = new BattleTreeRun(json.uuid ?? undefined);

        run._stage(json.stage ?? 0);
        run._seed(json.seed ?? 0);
        run._state(json.state ?? BattleTreeRunState.TEAM_SELECTION);

        json.modifiers?.forEach(id => BattleTreeModifiers.addModifier(json.uuid, id));

        run._teamA(json.teamA?.map(p => BattleTreePokemon.fromJSON(p)) ?? []);
        run._teamB(json.teamB?.map(p => BattleTreePokemon.fromJSON(p)) ?? []);

        run._runTimer(json.runTime ?? 0);
        run._combatTimer(json.combatTime ?? 0);

        run._selectedPokemon(json.selectedPokemon ?? null);

        if (json.battle?.pokemonA && json.battle?.pokemonB) {
            run.createBattle(json.battle.pokemonA, json.battle.pokemonB);
        }

        return run;
    }
}
