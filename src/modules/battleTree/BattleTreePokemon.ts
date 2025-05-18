import { PokemonNameType } from '../pokemons/PokemonNameType';
import { Observable, PureComputed } from 'knockout';
import { pokemonMap } from '../pokemons/PokemonList';
import TypeHelper from '../types/TypeHelper';
import PokemonType from '../enums/PokemonType';
import Rand from '../utilities/Rand';
import { BattleTreeModifiers } from './BattleTreeModifiers';
import {
    BattleTreeModifierEffectTarget,
    BattleTreeModifierEffectSource, BattleTreeModifierEffectType,
} from './BattleTreeModifier';
import { BattlePokemonGender } from '../GameConstants';

type BattleTreePokemonProperties = {
    runID: string;
    name: PokemonNameType;
    level: number;
    modifierTargetID: BattleTreeModifierEffectTarget,
};

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

const animateHeal = (uuid: string, health: number) => {
    const target = $(`#animate-damage-${uuid}`);

    if (!target.length || !target.is(':visible')) {
        return;
    }

    const left = (target.position().left + Rand.float(target.width() - 25)).toFixed(2);
    const top = target.position().top;
    const animatedElement = document.createElement('p');
    animatedElement.className = 'animated-damage';
    animatedElement.style.cssText = `top: ${top}px; left: ${left}px; font-size: 1rem; color: var(--success)`;
    animatedElement.innerText = health.toLocaleString('en-US');

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

export class BattleTreePokemon {
    public readonly uuid: string;

    private readonly _properties: BattleTreePokemonProperties;

    private _hp: Observable<number> = ko.observable(0).extend({ numeric: 0 });

    // BASE VALUES
    private _baseAttack: PureComputed<number> = ko.pureComputed(() => Math.max(this.processModifierEffects(pokemonMap[this._properties.name].base.attack, 'base-attack'), 0));
    private _baseDefense: PureComputed<number> = ko.pureComputed(() => Math.max(this.processModifierEffects(pokemonMap[this._properties.name].base.defense, 'base-defense'), 0));
    private _baseMaxHitPoints: PureComputed<number> = ko.pureComputed(() => Math.max(this.processModifierEffects(pokemonMap[this._properties.name].base.hitpoints, 'base-max-hitpoints'), 0));
    private _baseSpeed: PureComputed<number> = ko.pureComputed(() => Math.max(this.processModifierEffects(pokemonMap[this._properties.name].base.speed, 'base-speed'), 0));

    // CALCULATED VALUES
    private _attack: PureComputed<number> = ko.pureComputed(() => Math.floor(this.processModifierEffects(statPointFormula(this._baseAttack(), this.level), 'attack')));
    private _defense: PureComputed<number> = ko.pureComputed(() => Math.floor(this.processModifierEffects(statPointFormula(this._baseDefense(), this.level), 'defense')));
    private _maxHitPoints: PureComputed<number> = ko.pureComputed(() => Math.max(Math.floor(this.processModifierEffects(hitPointFormula(this._baseMaxHitPoints(), this.level), 'max-hitpoints')), 1));
    private _speed: PureComputed<number> = ko.pureComputed(() => Math.floor(this.processModifierEffects(statPointFormula(this._baseSpeed(), this.level), 'speed')));

    private _shiny: Observable<boolean | undefined> = ko.observable(undefined);
    private _gender: Observable<BattlePokemonGender | undefined> = ko.observable(undefined);

    constructor(properties: BattleTreePokemonProperties) {
        this.uuid = crypto.randomUUID();

        this._properties = properties;

        this._hp(this.maxHP);

        this._maxHitPoints.subscribe(function () {
            this._hp(Math.min(this.maxHP, this._hp()));
        }, this, 'spectate');
    }

    private processModifierEffects(initialValue: number, source: BattleTreeModifierEffectSource): number {
        return BattleTreeModifiers.getModifierList(this._properties.runID)()
            .flatMap(value => value.effects)
            .filter(value => value.source === source && (!value.target || !this._properties.modifierTargetID || value.target === this._properties.modifierTargetID))
            .reduce((previousValue, currentValue) => {
                switch (currentValue.type) {
                    case BattleTreeModifierEffectType.Additive: return previousValue + currentValue.value;
                    case BattleTreeModifierEffectType.Multiplicative: return previousValue * currentValue.value;
                    case BattleTreeModifierEffectType.Reset: return initialValue;
                    case BattleTreeModifierEffectType.Set: return currentValue.value;
                }
            }, initialValue);
    }

    public attackTarget(target: BattleTreePokemon): void {
        const power: number = 40;

        const typeEfficiency = this.getBestTypeEfficiency(
            pokemonMap[this.name].type[0],
            pokemonMap[this.name].type[1],
            pokemonMap[target.name].type[0],
            pokemonMap[target.name].type[1],
        );

        const baseDamage = ((2 * this.level / 5 + 2) * power * this.attack / target.defense / 50 + 2);
        const damage = Math.floor(this.processModifierEffects(baseDamage, 'damage') * typeEfficiency);

        target.takeDamage(damage);
    }

    private getBestTypeEfficiency(attackerTypeA: PokemonType, attackerTypeB: PokemonType, defenderTypeA: PokemonType, defenderTypeB: PokemonType): number {
        attackerTypeB = attackerTypeB ?? attackerTypeA;
        defenderTypeB = defenderTypeB ?? defenderTypeA;

        return (TypeHelper.typeMatrix[attackerTypeA][defenderTypeA] * TypeHelper.typeMatrix[attackerTypeA][defenderTypeB] +
            TypeHelper.typeMatrix[attackerTypeB][defenderTypeA] * TypeHelper.typeMatrix[attackerTypeB][defenderTypeB]) / 2;
    }

    public takeDamage(damage: number): void {
        this._hp(Math.min(Math.max(this._hp() - damage, 0), this.maxHP));
        animateDamage(this.uuid, damage);
    }

    public heal(health: number): void {
        this._hp(Math.min(Math.max(this._hp() + health, 0), this.maxHP));
        animateHeal(this.uuid, health);
    }

    get name(): PokemonNameType {
        return this._properties.name;
    }

    get level(): number {
        return Math.max(Math.floor(this.processModifierEffects(this._properties.level, 'level')), 1);
    }

    get HP(): number {
        return this._hp();
    }

    get maxHP(): number {
        return this._maxHitPoints();
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

    get shiny(): boolean | undefined {
        return this._shiny();
    }

    set shiny(value: boolean | undefined) {
        this._shiny(value);
    }

    get gender(): BattlePokemonGender {
        return this._gender();
    }

    set gender(value: BattlePokemonGender | undefined) {
        this._gender(value);
    }

    toJSON(): Record<string, any> {
        return {
            runID: this._properties.runID,
            name: this._properties.name,
            level: this._properties.level,
            targetID: this._properties.modifierTargetID,
            hp: this._hp(),
            shiny: this._shiny() || undefined,
            gender: this._gender(),
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreePokemon {
        const pokemon: BattleTreePokemon = new BattleTreePokemon({
            runID: json.runID,
            name: json.name,
            level: json.level,
            modifierTargetID: json.targetID,
        });

        pokemon._hp(json.hp ?? pokemon.maxHP);
        pokemon._shiny(json.shiny);
        pokemon._gender(json.gender);

        return pokemon;
    }
}
