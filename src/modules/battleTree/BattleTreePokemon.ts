import { PokemonNameType } from '../pokemons/PokemonNameType';

type BattleTreePokemonProperties = {
    name: PokemonNameType;
    level: number;
};

export class BattleTreePokemon {
    private readonly _name: PokemonNameType;
    private readonly _level: number;

    private _attackCounter: number;

    constructor(properties: BattleTreePokemonProperties) {
        this._name = properties.name;
        this._level = properties.level;

        this._attackCounter = 0;
    }

    public update(delta: number): void {
        this._attackCounter += delta;
    }

    get name(): PokemonNameType {
        return this._name;
    }

    get level(): number {
        return this._level;
    }

    toJSON(): Record<string, any> {
        return {
            name: this._name,
            level: this._level,
            attackCounter: this._attackCounter,
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreePokemon {
        const pokemon: BattleTreePokemon = new BattleTreePokemon({
            name: json.name,
            level: json.level,
        });

        pokemon._attackCounter = json.attackCounter ?? 0;

        return pokemon;
    }
}
