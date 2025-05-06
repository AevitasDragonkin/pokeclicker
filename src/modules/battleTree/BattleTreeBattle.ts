import { BattleTreePokemon } from './BattleTreePokemon';

type BattleTreeBattleProperties = {
    pokemonA: BattleTreePokemon;
    pokemonB: BattleTreePokemon;
};

export class BattleTreeBattle {
    private readonly _pokemonA: BattleTreePokemon;
    private readonly _pokemonB: BattleTreePokemon;

    constructor(properties: BattleTreeBattleProperties) {
        this._pokemonA = properties.pokemonA;
        this._pokemonB = properties.pokemonB;
    }

    public update(delta: number): void {
        // TODO : BT : Implement the battle game loop
    }

    get pokemonA(): BattleTreePokemon {
        return this._pokemonA;
    }

    get pokemonB(): BattleTreePokemon {
        return this._pokemonB;
    }
}
