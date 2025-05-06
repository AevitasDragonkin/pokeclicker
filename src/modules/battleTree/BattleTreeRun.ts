import { Observable } from 'knockout';
import { BattleTreeBattle } from './BattleTreeBattle';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { BattleTreePokemon } from './BattleTreePokemon';

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

    constructor() {
        this._seed = ko.observable(0); // TODO : BT : Seed correctly
        this._stage = ko.observable(1);
        this._state = ko.observable(BattleTreeRunState.TEAM_SELECTION);
        this._battle = ko.observable(null);
    }

    public update(delta: number): void {
        // TODO : BT : Update the run game loop
        if (this.state === BattleTreeRunState.BATTLE) {
            this._battle()?.update(delta);
        }
    }

    public createBattle(pokemonAName: PokemonNameType, pokemonBName: PokemonNameType) {
        // TODO : BT : Fetch from correct team
        const pokemonA: BattleTreePokemon = new BattleTreePokemon({ name: pokemonAName, level: 1 });
        const pokemonB: BattleTreePokemon = new BattleTreePokemon({ name: pokemonBName, level: 1 });

        this._battle(new BattleTreeBattle({ pokemonA, pokemonB }));
        this._state(BattleTreeRunState.BATTLE);
    }

    get stage(): number {
        return this._stage();
    }

    get state(): BattleTreeRunState {
        return this._state();
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
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreeRun {
        const run: BattleTreeRun = new BattleTreeRun();

        run._stage(json.stage ?? 1);
        run._seed(json.seed ?? 0);
        run._state(json.state ?? BattleTreeRunState.TEAM_SELECTION);

        if (json.battle?.pokemonA && json.battle?.pokemonB) {
            run.createBattle(json.battle.pokemonA, json.battle.pokemonB);
        }

        return run;
    }
}
