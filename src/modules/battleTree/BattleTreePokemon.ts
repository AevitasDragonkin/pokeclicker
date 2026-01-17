import { PokemonNameType } from '../pokemons/PokemonNameType';

interface BattleTreePokemonProperties {
    name: PokemonNameType;
    level: number;
}

export class BattleTreePokemon {
    private _name: string;
    private _level: number;

    constructor(properties: BattleTreePokemonProperties) {
        this._name = properties.name;
        this._level = properties.level;
    }

    get name(): string {
        return this._name;
    }

    get level(): number {
        return this._level;
    }
}
