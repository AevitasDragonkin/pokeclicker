import { PokemonListData, pokemonMap } from '../../pokemons/PokemonList';
import PokemonType from '../../enums/PokemonType';
import { Region } from '../../GameConstants';
import Requirement from '../../requirements/Requirement';

export type BattleTreePokemonSubsetNameType = 'All'
| 'Kanto'
| 'Johto'
| 'Hoenn'
| 'Sinnoh'
| 'Unova'
| 'Kalos'
| 'Alola'
| 'Galar'
// | 'Hisui'
// | 'Paldea'
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
// | 'Pure Normal'
// | 'Pure Fire'
// | 'Pure Water'
// | 'Pure Electric'
// | 'Pure Grass'
// | 'Pure Ice'
// | 'Pure Fighting'
// | 'Pure Poison'
// | 'Pure Ground'
// | 'Pure Flying'
// | 'Pure Psychic'
// | 'Pure Bug'
// | 'Pure Rock'
// | 'Pure Ghost'
// | 'Pure Dragon'
// | 'Pure Dark'
// | 'Pure Steel'
// | 'Pure Fairy';
| 'Legendary';

interface BattleTreePokemonSubsetProperties {
    name: BattleTreePokemonSubsetNameType;
    customOpponentWeight?: Partial<Record<BattleTreePokemonSubsetNameType, number>>;
    weight?: number;
    requirement?: Requirement;
}

export abstract class BattleTreePokemonSubset {
    protected _name: BattleTreePokemonSubsetNameType;
    protected _customOpponentWeight: Partial<Record<BattleTreePokemonSubsetNameType, number>>;

    protected _weight: number;
    protected _requirement?: Requirement;

    constructor(properties: BattleTreePokemonSubsetProperties) {
        this._name = properties.name;
        this._customOpponentWeight = properties.customOpponentWeight || { };
        this._weight = properties.weight ?? 1;
        this._requirement = properties.requirement;
    }

    getCustomSubsetWeight(name: BattleTreePokemonSubsetNameType): number | null {
        return this._customOpponentWeight[name] || null;
    }

    get name(): BattleTreePokemonSubsetNameType {
        return this._name;
    }

    abstract get subset(): PokemonListData[];

    get weight(): number {
        return this._weight;
    }

    get requirement(): Requirement | undefined {
        return this._requirement;
    }
}

interface TypedBattleTreePokemonSubsetProperties extends BattleTreePokemonSubsetProperties {
    type: PokemonType;
    monotype?: boolean;
}

export class TypedBattleTreePokemonSubset extends BattleTreePokemonSubset {
    private readonly _type: PokemonType;
    private readonly _monotype: boolean;

    constructor(properties: TypedBattleTreePokemonSubsetProperties) {
        super(properties);

        this._type = properties.type;
        this._monotype = properties.monotype;
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

interface RegionBattleTreePokemonSubsetProperties extends BattleTreePokemonSubsetProperties {
    region: Region;
}

export class RegionBattleTreePokemonSubset extends BattleTreePokemonSubset {
    private readonly _region: Region;

    constructor(properties: RegionBattleTreePokemonSubsetProperties) {
        super(properties);
        this._region = properties.region;
    }

    get subset(): PokemonListData[] {
        return pokemonMap.filter(p => {
            if (p.nativeRegion !== this._region) {
                return false;
            }
            return PokemonLocations.isObtainable(p.name);
        });
    }
}

interface CustomBattleTreePokemonSubsetProperties extends BattleTreePokemonSubsetProperties {
    customFilter?: () => PokemonListData[];
}

export class CustomBattleTreePokemonSubset extends BattleTreePokemonSubset {
    private readonly _customFilter: () => PokemonListData[];

    constructor(properties: CustomBattleTreePokemonSubsetProperties) {
        super(properties);
        this._customFilter = properties.customFilter;
    }

    get subset(): PokemonListData[] {
        if (this._customFilter) {
            return this._customFilter();
        }
        return pokemonMap.filter(p => {
            return PokemonLocations.isObtainable(p.name);
        });
    }
}
