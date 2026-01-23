import { Observable, PureComputed } from 'knockout';
import { BattleTreeUtil } from './util/BattleTreeUtil';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { pokemonMap } from '../pokemons/PokemonList';
import { BattleTreePokemonSubset } from './subset/BattleTreePokemonSubset';
import { BattleTreeTeam, BattleTreeTeamSaveData } from './BattleTreeTeam';
import { BattleTreeFight, BattleTreeFightSaveData, BattleTreeFightWinner } from './BattleTreeFight';

type TeamType = 'Team_A' | 'Team_B';

interface BattleTreeSequenceSaveData {
    seed: number;
    state: BattleTreeSequenceState;
    stage: number;

    fight: BattleTreeFightSaveData | null;
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

    private _fight: Observable<BattleTreeFight | null>;
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

        this._fight = ko.observable(null);
        this._sequenceTimer = ko.observable(0);
        this._combatTimer = ko.observable(0);

        this._teams = {
            Team_A: new BattleTreeTeam({}),
            Team_B: new BattleTreeTeam({}),
        };
    }

    public startFighting(): boolean {
        if (this._state() === BattleTreeSequenceState.PREPARATION) {
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
        this.updateTimers(delta);

        if (this.state === BattleTreeSequenceState.BATTLE && this.fight) {
            this.fight.update(delta);

            if (this.fight.isFinished) {
                this.handleFightFinished();
            }
        }
    }

    private updateTimers(delta: number): void {
        if (this.state === BattleTreeSequenceState.BATTLE) {
            this._combatTimer(this._combatTimer() + delta);
        }
        if (this.state !== BattleTreeSequenceState.FINISHED) {
            this._sequenceTimer(this._sequenceTimer() + delta);
        }
    }

    private handleFightFinished(): void {
        if (!this.fight) return;

        if (this.fight.winner === BattleTreeFightWinner.POKEMON_A || this.fight.winner === BattleTreeFightWinner.DRAW) {
            // TODO : handle player winning this fight
        }

        if (this.teams.Team_A.canContinueToFight && this.teams.Team_B.canContinueToFight) {
            this._fight(new BattleTreeFight({
                pokemonA: this.teams.Team_A.getPokemonAvailableToFight(this.fight.pokemonA.name),
                pokemonB: this.teams.Team_B.getPokemonAvailableToFight(this.fight.pokemonB.name),
            }));
        } else if (this.fight.winner === BattleTreeFightWinner.POKEMON_A) {
            // TODO : Handle finishing the sage
            this.nextStage();
        } else {
            // TODO : Handle defeat
            this._state(BattleTreeSequenceState.REWARD);
        }
    }

    public claimRewards(): void {
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

    get fight(): BattleTreeFight | null {
        return this._fight();
    }

    public toJSON(): BattleTreeSequenceSaveData {
        return {
            seed: this._seed(),
            state: this._state(),
            stage: this._stage(),
            fight: this._fight()?.toJSON() ?? null,
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

        if (json.fight) {
            sequence._fight(new BattleTreeFight({
                pokemonA: sequence.teams.Team_A.getPokemonAvailableToFight(json.fight.pokemonA),
                pokemonB: sequence.teams.Team_B.getPokemonAvailableToFight(json.fight.pokemonB),
                attackCounter: json.fight.attackCounter,
                attacker: json.fight.attacker,
            }));
        }

        return sequence;
    }
}
