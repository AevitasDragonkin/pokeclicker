import { PokemonNameType } from '../pokemons/PokemonNameType';
import { Observable, PureComputed } from 'knockout';
import { pokemonMap } from '../pokemons/PokemonList';
import TypeHelper from '../types/TypeHelper';
import PokemonType from '../enums/PokemonType';

type BattleTreePokemonProperties = {
    name: PokemonNameType;
    level: number;
};

const hitPointFormula = (base: number, iv: number, ev: number, level: number) => Math.floor(0.01 * (2 * base + iv + Math.floor(0.25 * ev)) * level) + level + 10;
const statPointFormula = (base: number, iv: number, ev: number, level: number, nature: number) => (Math.floor(0.01 * (2 * base + iv + Math.floor(0.25 * ev)) * level) + 5) * nature;

export class BattleTreePokemon {
    private readonly _name: PokemonNameType;
    private readonly _level: number;

    private _hitPoints: Observable<number> = ko.observable(0).extend({ numeric: 0 });
    private _attackCounter: number;

    private _attack: PureComputed<number> = ko.pureComputed(() => statPointFormula(pokemonMap[this._name].base.attack, 1, 1, this._level, 1));
    private _defense: PureComputed<number> = ko.pureComputed(() => statPointFormula(pokemonMap[this._name].base.defense, 1, 1, this._level, 1));
    private _maxHitPoints: PureComputed<number> = ko.pureComputed(() => hitPointFormula(pokemonMap[this._name].base.hitpoints, 1, 1, this._level));
    private _attackSpeed: PureComputed<number> = ko.pureComputed(() => statPointFormula(pokemonMap[this._name].base.attack, 1, 1, this._level, 1));
    private _attacksPerSecond: PureComputed<number> = ko.pureComputed(() => 1.5 * Math.pow((this._attackSpeed() - 1) / 254, 2) + 0.5);

    constructor(properties: BattleTreePokemonProperties) {
        this._name = properties.name;
        this._level = properties.level;

        this._hitPoints(this.maxHitPoints);
        this._attackCounter = 0;
    }

    public update(delta: number): void {
        this._attackCounter += delta;
    }

    public attackTarget(target: BattleTreePokemon): void {
        while (this.canAttack) {
            const power: number = 40;

            const typeEfficiency = this.getBestTypeEfficiency(
                pokemonMap[this.name].type[0],
                pokemonMap[this.name].type[1],
                pokemonMap[target.name].type[0],
                pokemonMap[target.name].type[1],
            );

            const damage = Math.floor(((2 * this.level / 5 + 2) * power * this.attack / target.defense / 50 + 2) * typeEfficiency);

            target.takeDamage(damage);

            this._attackCounter -= 1 / this.attacksPerSecond;
        }
    }

    private getBestTypeEfficiency(attackerTypeA: PokemonType, attackerTypeB: PokemonType, defenderTypeA: PokemonType, defenderTypeB: PokemonType): number {
        attackerTypeB = attackerTypeB ?? attackerTypeA;
        defenderTypeB = defenderTypeB ?? defenderTypeA;

        return (TypeHelper.typeMatrix[attackerTypeA][defenderTypeA] * TypeHelper.typeMatrix[attackerTypeA][defenderTypeB] +
            TypeHelper.typeMatrix[attackerTypeB][defenderTypeA] * TypeHelper.typeMatrix[attackerTypeB][defenderTypeB]) / 2;
    }

    public takeDamage(damage: number): void {
        this._hitPoints(Math.max(this._hitPoints() - damage, 0));
    }

    public resetAttackCounter(): void {
        this._attackCounter = 0;
    }

    get name(): PokemonNameType {
        return this._name;
    }

    get level(): number {
        return this._level;
    }

    get hitPoints(): number {
        return this._hitPoints();
    }

    get maxHitPoints(): number {
        return this._maxHitPoints();
    }

    get attack(): number {
        return this._attack();
    }

    get defense(): number {
        return this._defense();
    }

    get attackSpeed(): number {
        return this._attackSpeed();
    }

    get attacksPerSecond(): number {
        return this._attacksPerSecond();
    }

    get canAttack(): boolean {
        return this._attackCounter >= 1 / this.attacksPerSecond;
    }

    toJSON(): Record<string, any> {
        return {
            name: this._name,
            level: this._level,
            hp: this._hitPoints(),
            attackCounter: this._attackCounter,
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreePokemon {
        const pokemon: BattleTreePokemon = new BattleTreePokemon({
            name: json.name,
            level: json.level,
        });

        pokemon._hitPoints(json.hp ?? pokemon.maxHitPoints);
        pokemon._attackCounter = json.attackCounter ?? 0;

        return pokemon;
    }
}
