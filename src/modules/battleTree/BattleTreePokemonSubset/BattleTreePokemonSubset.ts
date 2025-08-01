import PokemonType from '../../enums/PokemonType';
import { PokemonListData, pokemonMap } from '../../pokemons/PokemonList';

export type BattleTreePokemonSubsetNameType = 'All'
| 'Legendary + Mythic'
| 'Kanto'
| 'Johto'
| 'Hoenn'
| 'Sinnoh'
| 'Unova'
| 'Kalos'
| 'Alola'
| 'Galar'
| 'Hisui'
| 'Paldea'
| 'Normal'
| 'Fire'
| 'Water'
| 'Electric'
| 'Grass'
| 'Ice'
| 'Fighting'
| 'Poison'
| 'Ground'
| 'Flying'
| 'Psychic'
| 'Bug'
| 'Rock'
| 'Ghost'
| 'Dragon'
| 'Dark'
| 'Steel'
| 'Fairy'
| 'Pure Normal'
| 'Pure Fire'
| 'Pure Water'
| 'Pure Electric'
| 'Pure Grass'
| 'Pure Ice'
| 'Pure Fighting'
| 'Pure Poison'
| 'Pure Ground'
| 'Pure Flying'
| 'Pure Psychic'
| 'Pure Bug'
| 'Pure Rock'
| 'Pure Ghost'
| 'Pure Dragon'
| 'Pure Dark'
| 'Pure Steel'
| 'Pure Fairy';

export abstract class BattleTreePokemonSubset {
    protected _name: BattleTreePokemonSubsetNameType;
    protected _nonCompatible: BattleTreePokemonSubsetNameType[];

    constructor(name: BattleTreePokemonSubsetNameType, nonCompatible: BattleTreePokemonSubsetNameType[] = []) {
        this._name = name;
        this._nonCompatible = nonCompatible;
    }

    abstract get subset(): PokemonListData[];
}

export class TypedBattleTreePokemonSubset extends BattleTreePokemonSubset {
    private readonly _type: PokemonType;
    private readonly _monotype: boolean;

    constructor(name: BattleTreePokemonSubsetNameType, type: PokemonType, monotype: boolean, nonCompatible: BattleTreePokemonSubsetNameType[] = []) {
        super(name, nonCompatible);

        this._type = type;
        this._monotype = monotype;
    }

    get subset(): PokemonListData[] {
        return pokemonMap.filter(p => {
            if (this._monotype && !p.type.every(t => t === this._type)) {
                return false;
            } else if (!this._monotype && !p.type.includes(this._type)) {
                return false;
            }
            return PokemonLocations.isObtainable(p.name);
        });
    }
}
