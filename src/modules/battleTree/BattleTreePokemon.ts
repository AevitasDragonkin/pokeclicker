import { PokemonNameType } from '../pokemons/PokemonNameType';
import { Observable, PureComputed } from 'knockout';
import { pokemonMap } from '../pokemons/PokemonList';
import PokemonType from '../enums/PokemonType';
import TypeHelper from '../types/TypeHelper';

interface BattleTreePokemonProperties {
    name: PokemonNameType;
    level: number;
}

export interface BattleTreePokemonSaveData {
    name: PokemonNameType;
    level: number;
    hp: number;
}

const hitPointFormula = (base: number, level: number) => Math.floor(0.01 * (2 * base) * level) + level + 10;
const statPointFormula = (base: number, level: number) => (Math.floor(0.01 * (2 * base) * level) + 5);

export class BattleTreePokemon {
    private _name: PokemonNameType;
    private _level: number;

    private _attack: PureComputed<number> = ko.pureComputed(() => statPointFormula(pokemonMap[this._name].base.attack, this.level));
    private _defense: PureComputed<number> = ko.pureComputed(() => statPointFormula(pokemonMap[this._name].base.defense, this.level));
    private _speed: PureComputed<number> = ko.pureComputed(() => statPointFormula(pokemonMap[this._name].base.speed, this.level));
    private _maxHitpoints: PureComputed<number> = ko.pureComputed(() => hitPointFormula(pokemonMap[this._name].base.hitpoints, this.level));

    private _hp: Observable<number> = ko.observable(0).extend({ numeric: 0 });

    constructor(properties: BattleTreePokemonProperties) {
        this._name = properties.name;
        this._level = properties.level;

        this._hp(this.maxHitpoints);

        this._maxHitpoints.subscribe(function () {
            this._hp(Math.min(this.maxHitpoints, this._hp()));
        }, this, 'spectate');
    }

    public attackTarget(target: BattleTreePokemon): void {
        const baseDamage = ((2 * this.level / 5 + 2) * this.power * this.attack / target.defense / 50 + 2);

        const attacker = pokemonMap[this._name];

        target.takeDamage([...attacker.type.map(type => ({
            damage: baseDamage / attacker.type.length,
            type,
        }))]);
    }

    public takeDamage(damages: Array<{ damage: number, type: PokemonType }>): void {
        const defender = pokemonMap[this._name];

        const transformedDamages = damages.map(({ damage: incomingBaseDamage, type }) => ({
            damage: defender.type.reduce((previousValue, currentValue) => {
                return incomingBaseDamage / defender.type.length * TypeHelper.typeMatrix[type][currentValue];
            }, 0),
            type: type,
        }));

        const totalDamageTaken = transformedDamages.reduce((previousValue, currentValue) => previousValue + currentValue.damage, 0);

        this._hp(Math.max(this._hp() - totalDamageTaken, 0));
    }

    get name(): PokemonNameType {
        return this._name;
    }

    get level(): number {
        return this._level;
    }

    get power(): number {
        return 40;
    }

    get attack(): number {
        return this._attack();
    }

    get defense(): number {
        return this._defense();
    }

    get speed(): number {
        return this._speed();
    }

    get maxHitpoints(): number {
        return this._maxHitpoints();
    }

    get hitpoints(): number {
        return this._hp();
    }

    public toJSON(): BattleTreePokemonSaveData {
        return {
            name: this._name,
            level: this._level,
            hp: this._hp(),
        };
    }

    static fromJSON(json: BattleTreePokemonSaveData): BattleTreePokemon {
        const pokemon: BattleTreePokemon = new BattleTreePokemon({
            name: json.name,
            level: json.level,
        });

        pokemon._hp(json.hp ?? pokemon.maxHitpoints);

        return pokemon;
    }
}
