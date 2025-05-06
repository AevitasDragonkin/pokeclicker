import { Observable, ObservableArray } from 'knockout';
import { BattleTreeBattle, BattleTreeBattleWinner } from './BattleTreeBattle';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { BattleTreePokemon } from './BattleTreePokemon';
import { BattleTreeController } from './BattleTreeController';

export enum BattleTreeRunState {
    TEAM_SELECTION,
    BATTLE,
    REWARD,
    FINISHED,
}

export class BattleTreeRun {
    private _seed: Observable<number>;
    private _stage: Observable<number>;
    private _state: Observable<BattleTreeRunState>;

    private _battle: Observable<BattleTreeBattle | null>;

    private _teamA: ObservableArray<BattleTreePokemon>;
    private _teamB: ObservableArray<BattleTreePokemon>;

    private _selectedPokemon: Observable<PokemonNameType | null>;

    constructor() {
        this._seed = ko.observable(0); // TODO : BT : Seed correctly
        this._stage = ko.observable(0);
        this._state = ko.observable(BattleTreeRunState.TEAM_SELECTION);

        this._battle = ko.observable(null);

        this._teamA = ko.observableArray();
        this._teamB = ko.observableArray();

        this._selectedPokemon = ko.observable(null);
    }

    public update(delta: number): void {
        if (this.state === BattleTreeRunState.BATTLE) {
            this._battle()?.update(delta);

            if (this._battle()?.isFinished) {
                const teamACanContinue: boolean = this._teamA().some(p => p.hitPoints > 0);
                const teamBCanContinue: boolean = this._teamB().some(p => p.hitPoints > 0);

                if (teamACanContinue && teamBCanContinue) {
                    // Set the selected pokemon to the current one if it still has HP, otherwise switch it to the first one with HP
                    this._selectedPokemon(this._teamA().find(p => p.name === this._selectedPokemon()).hitPoints > 0 ? this._selectedPokemon() : this._teamA().find(p => p.hitPoints > 0).name);

                    // Reset all attack counters
                    this._teamA().forEach(p => p.resetAttackCounter());
                    this._teamB().forEach(p => p.resetAttackCounter());

                    // Start a new battle
                    this.createBattle(this._selectedPokemon(), this._teamB().find(p => p.hitPoints > 0).name);

                } else if (this._battle().winner === BattleTreeBattleWinner.PLAYER_A) {
                    // TODO : BT : Give stage reward
                    this._state(BattleTreeRunState.REWARD);
                } else {
                    // TODO : BT : Give final reward
                    this._state(BattleTreeRunState.FINISHED);
                }
            }
        }
    }

    public createBattle(pokemonAName: PokemonNameType, pokemonBName: PokemonNameType) {
        const pokemonA: BattleTreePokemon = this._teamA().find((p: BattleTreePokemon) => p.name === pokemonAName);
        const pokemonB: BattleTreePokemon = this._teamB().find((p: BattleTreePokemon) => p.name === pokemonBName);

        if (pokemonA && pokemonB) {
            this._battle(new BattleTreeBattle({ pokemonA, pokemonB }));
            this._state(BattleTreeRunState.BATTLE);
        }
    }

    public startRun(): void {
        if (!this._selectedPokemon()) {
            this._selectedPokemon(this._teamA()[0].name);
        }
        this.nextStage();
    }

    public nextStage(): void {
        this._stage(this._stage() + 1);

        this._teamB(BattleTreeController.getRandomTeamForStage(this._seed(), this._stage(), 3));
        this.createBattle(this._selectedPokemon(), this._teamB()[0].name);
    }

    public addPokemonToPlayerATeam(pokemon: PokemonNameType): void {
        if (this._teamA().length >= 3) return;
        if (this._teamA().findIndex(p => p.name === pokemon) >= 0) return;

        this._teamA.push(new BattleTreePokemon({ name: pokemon, level: BattleTreeController.calculatePokemonLevelForPlayer(pokemon) }));
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
        this._selectedPokemon(pokemon);

        // Reset all attack counter when a player switches his pokemon
        // Team B will not reset its attack counter
        this._teamA().forEach(p => p.resetAttackCounter());

        // Create a new battle with the selected pokemon and the first enemy in team B
        this.createBattle(this._selectedPokemon(), this._teamB().find(p => p.hitPoints > 0).name);
    }

    get battle(): BattleTreeBattle {
        return this._battle();
    }

    toJSON(): Record<string, any> {
        return {
            seed: this._seed(),
            stage: this._stage(),
            state: this._state(),
            battle: this._battle() ? {
                pokemonA: this._battle().pokemonA.name,
                pokemonB: this._battle().pokemonB.name,
            } : undefined,
            teamA: this._teamA().map((p: BattleTreePokemon) => p.toJSON()),
            teamB: this._teamB().map((p: BattleTreePokemon) => p.toJSON()),
            selectedPokemon: this._selectedPokemon(),
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreeRun {
        const run: BattleTreeRun = new BattleTreeRun();

        run._stage(json.stage ?? 0);
        run._seed(json.seed ?? 0);
        run._state(json.state ?? BattleTreeRunState.TEAM_SELECTION);

        run._teamA(json.teamA?.map(p => BattleTreePokemon.fromJSON(p)) ?? []);
        run._teamB(json.teamB?.map(p => BattleTreePokemon.fromJSON(p)) ?? []);

        run._selectedPokemon(json.selectedPokemon ?? null);

        if (json.battle?.pokemonA && json.battle?.pokemonB) {
            run.createBattle(json.battle.pokemonA, json.battle.pokemonB);
        }

        return run;
    }
}
