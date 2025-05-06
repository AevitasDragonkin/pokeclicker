import { BattleTreePokemon } from './BattleTreePokemon';

type BattleTreeBattleProperties = {
    pokemonA: BattleTreePokemon;
    pokemonB: BattleTreePokemon;
};

export class BattleTreeBattle {
    private _pokemonA: BattleTreePokemon;
    private _pokemonB: BattleTreePokemon;

    constructor(properties: BattleTreeBattleProperties) {
        this._pokemonA = properties.pokemonA;
        this._pokemonB = properties.pokemonB;
    }
}
