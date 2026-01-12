import { Observable, PureComputed } from 'knockout';
import { BattleTreeUtil } from './util/BattleTreeUtil';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { pokemonMap } from '../pokemons/PokemonList';
import { BattleTreePokemonSubset } from './subset/BattleTreePokemonSubset';

interface BattleTreeSequenceSaveData {
    seed: number;
    state: BattleTreeSequenceState;
    stage: number;

    sequenceTime: number;
    combatTime: number;
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

    public toJSON(): BattleTreeSequenceSaveData {
        return {
            seed: this._seed(),
            state: this._state(),
            stage: this._stage(),
            sequenceTime: this._sequenceTimer(),
            combatTime: this._combatTimer(),
        };
    }

    static fromJSON(json: BattleTreeSequenceSaveData): BattleTreeSequence {
        const sequence: BattleTreeSequence = new BattleTreeSequence();

        sequence._seed(json.seed);
        sequence._state(json.state);
        sequence._stage(json.stage);

        sequence._sequenceTimer(json.sequenceTime);
        sequence._combatTimer(json.combatTime);

        return sequence;
    }
}
