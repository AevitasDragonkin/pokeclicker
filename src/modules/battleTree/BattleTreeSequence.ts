import { Observable, PureComputed } from 'knockout';
import { BattleTreeUtil } from './util/BattleTreeUtil';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { pokemonMap } from '../pokemons/PokemonList';
import { BattleTreePokemonSubset } from './subset/BattleTreePokemonSubset';
import { BattleTreeTeam, BattleTreeTeamSaveData } from './BattleTreeTeam';

type TeamType = 'Team_A' | 'Team_B';

interface BattleTreeSequenceSaveData {
    seed: number;
    state: BattleTreeSequenceState;
    stage: number;

    sequenceTime: number;
    combatTime: number;

    teams: Record<TeamType, BattleTreeTeamSaveData>;
}

export enum BattleTreeSequenceState {
    PREPARATION = 'PREPARATION',
    BATTLE = 'BATTLE',
    REWARD = 'REWARD',
    MODIFIER = 'MODIFIER',
    FINISHED = 'FINISHED',
}

export class BattleTreeSequence {
    private _seed: Observable<number>;
    private _state: Observable<BattleTreeSequenceState>;
    private _stage: Observable<number>;

    private _sequenceTimer: Observable<number>;
    private _combatTimer: Observable<number>;

    private _teams: Record<TeamType, BattleTreeTeam>;

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

        this._sequenceTimer = ko.observable(0);
        this._combatTimer = ko.observable(0);

        this._teams = {
            Team_A: new BattleTreeTeam({}),
            Team_B: new BattleTreeTeam({}),
        };
    }

    public start(): boolean {
        if (this._state() === BattleTreeSequenceState.PREPARATION) {
            this._state(BattleTreeSequenceState.BATTLE);
            return true;
        }

        return false;
    }

    public update(delta: number): void {
        this.updateTimers(delta);
    }

    private updateTimers(delta: number): void {
        if (this.state === BattleTreeSequenceState.BATTLE) {
            this._combatTimer(this._combatTimer() + delta);
        }
        if (this.state !== BattleTreeSequenceState.FINISHED) {
            this._sequenceTimer(this._sequenceTimer() + delta);
        }
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

    public toJSON(): BattleTreeSequenceSaveData {
        return {
            seed: this._seed(),
            state: this._state(),
            stage: this._stage(),
            sequenceTime: this._sequenceTimer(),
            combatTime: this._combatTimer(),
            teams: Object
                .fromEntries(Object.entries(this.teams)
                    .map(([key, value]: [key: TeamType, value: BattleTreeTeam]) => [key as TeamType, value.toJSON()]),
                ) as Record<TeamType, BattleTreeTeamSaveData>,
        };
    }

    static fromJSON(json: BattleTreeSequenceSaveData): BattleTreeSequence {
        const sequence: BattleTreeSequence = new BattleTreeSequence();

        sequence._seed(json.seed);
        sequence._state(json.state);
        sequence._stage(json.stage);

        sequence._sequenceTimer(json.sequenceTime);
        sequence._combatTimer(json.combatTime);

        sequence._teams = Object
            .fromEntries(Object.entries(json.teams)
                .map(([key, value]) => [key, BattleTreeTeam.fromJSON(value)]),
            ) as Record<TeamType, BattleTreeTeam>;

        return sequence;
    }
}
