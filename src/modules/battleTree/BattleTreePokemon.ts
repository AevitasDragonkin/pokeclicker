import { PokemonNameType } from '../pokemons/PokemonNameType';
import { Observable, PureComputed } from 'knockout';
import { pokemonMap } from '../pokemons/PokemonList';
import PokemonType from '../enums/PokemonType';
import TypeHelper from '../types/TypeHelper';
import Rand from '../utilities/Rand';

interface BattleTreePokemonProperties {
    name: PokemonNameType;
    level: number;
}

export interface BattleTreePokemonSaveData {
    name: PokemonNameType;
    level: number;
    hp: number;
}

interface TypedDamage {
    type: PokemonType;
    damage: number;
}

const hitPointFormula = (base: number, level: number) => Math.floor(0.01 * (2 * base) * level) + level + 10;
const statPointFormula = (base: number, level: number) => (Math.floor(0.01 * (2 * base) * level) + 5);

const animateDamage = (uuid: string, damage: number) => {
    const target = $(`#animate-damage-${uuid}`);

    if (!target.length || !target.is(':visible')) {
        return;
    }

    const left = (target.position().left + Rand.float(target.width() - 25)).toFixed(2);
    const top = target.position().top;
    const animatedElement = document.createElement('p');
    animatedElement.className = 'animated-damage';
    animatedElement.style.cssText = `top: ${top}px; left: ${left}px; font-size: 1rem;`;
    animatedElement.innerText = damage.toLocaleString('en-US');

    const animationDirection = { top: top - 100 };
    const animationTime = 1500;

    $(animatedElement).prependTo(target.parent()).animate({
        ...animationDirection,
        opacity: 0,
    }, animationTime, 'linear',
    () => {
        $(animatedElement).remove();
    });
};

// const animateHeal = (uuid: string, health: number) => {
//     const target = $(`#animate-damage-${uuid}`);
//
//     if (!target.length || !target.is(':visible')) {
//         return;
//     }
//
//     const left = (target.position().left + Rand.float(target.width() - 25)).toFixed(2);
//     const top = target.position().top;
//     const animatedElement = document.createElement('p');
//     animatedElement.className = 'animated-damage';
//     animatedElement.style.cssText = `top: ${top}px; left: ${left}px; font-size: 1rem; color: var(--success)`;
//     animatedElement.innerText = health.toLocaleString('en-US');
//
//     const animationDirection = { top: top - 100 };
//     const animationTime = 1500;
//
//     $(animatedElement).prependTo(target.parent()).animate({
//         ...animationDirection,
//         opacity: 0,
//     }, animationTime, 'linear',
//     () => {
//         $(animatedElement).remove();
//     });
// };

export class BattleTreePokemon {
    public readonly uuid: string;

    private _name: PokemonNameType;
    private _level: number;

    private _attack: PureComputed<number> = ko.pureComputed(() => statPointFormula(pokemonMap[this._name].base.attack, this.level));
    private _defense: PureComputed<number> = ko.pureComputed(() => statPointFormula(pokemonMap[this._name].base.defense, this.level));
    private _speed: PureComputed<number> = ko.pureComputed(() => statPointFormula(pokemonMap[this._name].base.speed, this.level));
    private _maxHitpoints: PureComputed<number> = ko.pureComputed(() => hitPointFormula(pokemonMap[this._name].base.hitpoints, this.level));

    private _hp: Observable<number> = ko.observable(0).extend({ numeric: 0 });

    constructor(properties: BattleTreePokemonProperties) {
        this.uuid = crypto.randomUUID();

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

    public takeDamage(damages: TypedDamage[]): void {
        const defender = pokemonMap[this._name];

        const transformedDamages: TypedDamage[] = damages.map(({ type, damage }) => ({
            type,
            damage: defender.type.reduce((prev, curr) => prev + damage / defender.type.length * TypeHelper.typeMatrix[type][curr], 0),
        }));

        const totalDamage = Math.floor(transformedDamages.reduce((cumulative, typedDamage) => cumulative + typedDamage.damage, 0));

        this._hp(Math.max(this._hp() - totalDamage, 0));
        animateDamage(this.uuid, totalDamage);
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
