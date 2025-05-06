import { PokemonNameType } from '../pokemons/PokemonNameType';

type BattleTreePokemonProperties = {
    name: PokemonNameType;
    level: number;
};

export class BattleTreePokemon {
    private readonly _name: PokemonNameType;
    private readonly _level: number;

    constructor(properties: BattleTreePokemonProperties) {
        this._name = properties.name;
        this._level = properties.level;
    }

    toJSON(): Record<string, any> {
        return {
            name: this._name,
            level: this._level,
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreePokemon {
        return new BattleTreePokemon({
            name: json.name,
            level: json.level,
        });
    }
}
