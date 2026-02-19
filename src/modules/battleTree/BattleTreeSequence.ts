import { Observable, ObservableArray, PureComputed } from 'knockout';
import { BattleTreeUtil } from './util/BattleTreeUtil';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { pokemonMap } from '../pokemons/PokemonList';
import { BattleTreePokemonSubset } from './subset/BattleTreePokemonSubset';
import { BattleTreeTeam, BattleTreeTeamSaveData } from './BattleTreeTeam';
import { BattleTreeFight, BattleTreeFightSaveData, BattleTreeFightWinner } from './BattleTreeFight';
import { BattleTreeReward } from './BattleTreeReward';
import { ItemNameType } from '../items/ItemNameType';
import { BattleTreePokemon } from './BattleTreePokemon';
import { ItemList } from '../items/ItemList';
import Notifier from '../notifications/Notifier';
import NotificationOption from '../notifications/NotificationOption';
import {
    BattleTreeModifierManager,
    BattleTreeModifierManagerSaveData,
} from './modifier/BattleTreeModifierManager';
import { BattleTreeModifierContext } from './modifier/BattleTreeModifierContext';
import GameHelper from '../GameHelper';
import { BattleTreeModifierNameType } from './modifier/BattleTreeModifiers';
import { BattleTreeRewardPoolNameType } from './rewards/pools/BattleTreeRewardPool';
import { BattleTreeRewardPools } from './rewards/pools/BattleTreeRewardPools';
import Rand from '../utilities/Rand';
import { BattleTree } from './BattleTree';
import { BattleTreeSequenceState } from './types';

export type TeamType = 'Team_A' | 'Team_B';

interface BattleTreeSequenceSaveData {
    seed: number;
    state: BattleTreeSequenceState;
    stage: number;

    fight: BattleTreeFightSaveData | null;
    timers: Record<BattleTreeSequenceState, number>;

    teams: Record<TeamType, BattleTreeTeamSaveData>;
    rewards: Record<ItemNameType, number>;
    modifierManager: BattleTreeModifierManagerSaveData;
}

export class BattleTreeSequence {
    private _seed: Observable<number>;
    private _state: Observable<BattleTreeSequenceState>;
    private _stage: Observable<number>;

    private _fight: Observable<BattleTreeFight | null>;
    private _timers: Record<BattleTreeSequenceState, Observable<number>>;

    private _teams: Record<TeamType, BattleTreeTeam>;
    private _rewards: ObservableArray<BattleTreeReward>;

    private _modifierManager: BattleTreeModifierManager;

    public sequenceSubset: PureComputed<BattleTreePokemonSubset> = ko.pureComputed(() => {
        return BattleTreeUtil.getRandomSubset({ seed: this.seed });
    });

    public candidates: PureComputed<PokemonNameType[]> = ko.pureComputed(() => {
        return BattleTreeUtil
            .getRandomTeamFromSubset({ seed: this.seed, amount: 20, subset: this.sequenceSubset().name })
            .sort((a, b) => pokemonMap[a].id - pokemonMap[b].id) ;
    });

    constructor() {
        this._seed = ko.observable(BattleTreeUtil.calculateSeed());
        this._state = ko.observable(BattleTreeSequenceState.PREPARATION);
        this._stage = ko.observable(0);

        this._fight = ko.observable(null);

        this._timers = GameHelper.objectFromEnumStrings(BattleTreeSequenceState, () => ko.observable(0));

        this._teams = {
            Team_A: new BattleTreeTeam({ team: 'Team_A' }),
            Team_B: new BattleTreeTeam({ team: 'Team_B' }),
        };
        this._rewards = ko.observableArray();

        this._modifierManager = new BattleTreeModifierManager(this.createContext());
    }

    private createContext(): BattleTreeModifierContext {
        return {
            sequence: this,
            endSequence: reason => {
                console.log(`[BATTLE TREE] Context ending run: ${reason}`);
                this._state(BattleTreeSequenceState.REWARD);
            },
        };
    }

    public startFighting(): boolean {
        if (this._state() === BattleTreeSequenceState.PREPARATION) {
            if (BattleTree.autoPickModifiers()) {
                this.modifierManager.addSystemModifier('auto_pick_modifiers');
            }

            this.nextStage();
            return true;
        }

        return false;
    }

    private nextStage(): void {
        this._stage(this._stage() + 1);

        this.teams.Team_B.removeAllPokemon();
        const opponentSubset = BattleTreeUtil.getRandomSubset({ seed: this.seed + 1000, otherSubset: this.sequenceSubset().name });
        const opponentTeam = BattleTreeUtil.getRandomTeamFromSubset({ subset: opponentSubset.name, seed: this.seed, stage: this.stage, amount: 3 });

        opponentTeam.forEach(name => this.teams.Team_B.addPokemon(name, this.stage));

        this._fight(new BattleTreeFight({
            pokemonA: this.teams.Team_A.getPokemonAvailableToFight(this.fight?.pokemonA.name),
            pokemonB: this.teams.Team_B.getPokemonAvailableToFight(this.fight?.pokemonB.name),
        }));

        this._state(BattleTreeSequenceState.BATTLE);
    }

    public update(delta: number): void {
        const gameSpeedDelta = delta * this._modifierManager.getValue({ key: 'game_speed', base: 1 });
        const attackSpeed = this._modifierManager.getValue({ key: 'attack_speed', base: 1 });

        this.updateTimers(gameSpeedDelta);

        this._modifierManager.update({
            sequenceDeltaTime: gameSpeedDelta,
            combatDeltaTime: this.state === BattleTreeSequenceState.BATTLE && this.fight ? gameSpeedDelta * attackSpeed : 0,
        });

        if (this.state === BattleTreeSequenceState.BATTLE && this.fight) {
            this.fight.update(gameSpeedDelta * attackSpeed);

            if (this.fight.isFinished) {
                this.handleFightFinished();
            }
        }
    }

    private updateTimers(delta: number): void {
        this._timers[this.state](this._timers[this.state]() + delta);
    }

    private handleFightFinished(): void {
        if (!this.fight) return;

        if (this.fight.winner === BattleTreeFightWinner.POKEMON_A || this.fight.winner === BattleTreeFightWinner.DRAW) {
            // TODO : handle player winning this fight
            this.handleSinglePokemonDefeat(this.fight.pokemonB);
        }

        if (this.teams.Team_A.canContinueToFight && this.teams.Team_B.canContinueToFight) {
            this._fight(new BattleTreeFight({
                pokemonA: this.teams.Team_A.getPokemonAvailableToFight(this.fight.pokemonA.name),
                pokemonB: this.teams.Team_B.getPokemonAvailableToFight(this.fight.pokemonB.name),
            }));
        } else if (this.fight.winner === BattleTreeFightWinner.POKEMON_A) {
            // Every 10th stage defeat, roll on the generic table
            if (this.stage % 10 === 0 && this.stage > 0) {
                this.rollPool('generic', undefined, 1);
            }

            // TODO : Handle finishing the stage
            if (this.stage % 5 === 0 && this.stage > 0) {
                if (Math.random() < this._modifierManager.getValue({ key: 'auto_pick_modifier', base: 0 })) {
                    this.pickModifier(Rand.fromArray(App.game.battleTree.sequence.modifierManager.candidates()));
                } else {
                    this._state(BattleTreeSequenceState.MODIFIER);
                }
            } else {
                this.nextStage();
            }
        } else {
            // TODO : Handle defeat
            this._state(BattleTreeSequenceState.REWARD);
        }
    }

    private handleSinglePokemonDefeat(pokemon: BattleTreePokemon): void {
        const experience = BattleTreeUtil.calculateBattleTreeExperienceForPokemonDefeat(pokemon);

        this.addReward('Battle Tree Experience', experience);
    }

    public pickModifier(id: BattleTreeModifierNameType) {
        this._modifierManager.addPlayerModifier(id);
        this.nextStage();
    }

    private rollPool(id: BattleTreeRewardPoolNameType, seed?: number, amount: number = 1) {
        for (let i = 0; i < amount; ++i) {
            const pickedReward = BattleTreeRewardPools[id].roll(seed);
            this.addReward(pickedReward.item, pickedReward.amount);
        }
    }

    private addReward(item: ItemNameType, amount: number): void {
        const existing = this._rewards().find(i => i.item === item);

        if (existing) {
            existing.amount += amount;
        } else {
            this._rewards.push(new BattleTreeReward({ item, amount }));
        }
    }

    public forfeit(): void {
        this._modifierManager.addSystemModifier('forfeit');
    }

    public async discardRewards(): Promise<void> {
        if (await Notifier.confirm({
            title: 'Discard all rewards',
            message: 'Are you sure you want to discard all rewards?',
            type: NotificationOption.danger,
            confirm: 'Discard',
        })) {
            this._rewards([]);
            this.claimRewards();
        }
    }

    public claimRewards(): void {
        const rewardMultiplier = BattleTreeUtil.calculateRewardMultiplier();

        this._rewards().forEach(reward => {
            ItemList[reward.item].gain(Math.floor(Math.max(reward.amount * rewardMultiplier, 0)));
        });

        Notifier.notify({
            title: '[Battle Tree]',
            message: 'You have finished your Battle Tree run. Claim your rewards.',
            type: NotificationOption.success,
            timeout: 30e3,
        });

        this._state(BattleTreeSequenceState.FINISHED);
    }

    get seed(): number {
        return this._seed();
    }

    get state(): BattleTreeSequenceState {
        return this._state();
    }

    get stage(): number {
        return this._stage();
    }

    get teams(): Record<TeamType, BattleTreeTeam> {
        return this._teams;
    }

    get rewards(): BattleTreeReward[] {
        return this._rewards();
    }

    get fight(): BattleTreeFight | null {
        return this._fight();
    }

    get sequenceTime(): number {
        return this._timers.MODIFIER() + this._timers.BATTLE();
    }

    get combatTime(): number {
        return this._timers.BATTLE();
    }

    get modifierManager(): BattleTreeModifierManager {
        return this._modifierManager;
    }

    public toJSON(): BattleTreeSequenceSaveData {
        return {
            seed: this._seed(),
            state: this._state(),
            stage: this._stage(),
            fight: this._fight()?.toJSON() ?? null,
            timers: ko.toJS(this._timers),
            teams: Object
                .fromEntries(Object.entries(this.teams)
                    .map(([key, value]: [key: TeamType, value: BattleTreeTeam]) => [key as TeamType, value.toJSON()]),
                ) as Record<TeamType, BattleTreeTeamSaveData>,
            rewards: Object.fromEntries(this._rewards().map(value => [value.item as ItemNameType, value.amount])) as Record<ItemNameType, number>,
            modifierManager: this._modifierManager.toJSON(),
        };
    }

    static fromJSON(json: BattleTreeSequenceSaveData): BattleTreeSequence {
        const sequence: BattleTreeSequence = new BattleTreeSequence();

        sequence._seed(json.seed);
        sequence._state(json.state);
        sequence._stage(json.stage);

        Object.keys(sequence._timers).forEach(key => sequence._timers[key](json.timers[key] ?? 0));

        sequence._teams = Object
            .fromEntries(Object.entries(json.teams)
                .map(([key, value]: [TeamType, BattleTreeTeamSaveData]) => [key, BattleTreeTeam.fromJSON(value, key)]),
            ) as Record<TeamType, BattleTreeTeam>;
        sequence._rewards(Object.entries(json.rewards).map(([key, value]) => BattleTreeReward.fromJSON({ item: key as ItemNameType, amount: value })));

        if (json.fight) {
            sequence._fight(new BattleTreeFight({
                pokemonA: sequence.teams.Team_A.getPokemonAvailableToFight(json.fight.pokemonA),
                pokemonB: sequence.teams.Team_B.getPokemonAvailableToFight(json.fight.pokemonB),
                attackCounter: json.fight.attackCounter,
                attacker: json.fight.attacker,
            }));
        }

        sequence._modifierManager.fromJSON(json.modifierManager);

        return sequence;
    }
}
