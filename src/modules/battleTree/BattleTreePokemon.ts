import { PokemonNameType } from '../pokemons/PokemonNameType';
import { Observable, PureComputed } from 'knockout';
import { pokemonMap } from '../pokemons/PokemonList';
import TypeHelper from '../types/TypeHelper';
import Rand from '../utilities/Rand';
import { TeamType } from './BattleTreeSequence';
import { BattlePokemonGender } from '../GameConstants';

interface BattleTreePokemonProperties {
    name: PokemonNameType;
    level: number;
    team: TeamType;
}

export interface BattleTreePokemonSaveData {
    name: PokemonNameType;
    level: number;
    hp: number;
    shiny?: boolean;
    gender?: BattlePokemonGender;
}

export type DamageMapType = {
    [p: string]: {
        [p: string]: number
    }
};

const hitPointFormula = (base: number, level: number) => Math.floor(0.01 * (2 * base) * level) + level + 10;
const statPointFormula = (base: number, level: number) => (Math.floor(0.01 * (2 * base) * level) + 5);

const averageStat = (...values: number[])=> 7 / 8 * Math.max(...values) + 1 / 8 * Math.min(...values);

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
    animatedElement.style.cssText = `top: ${top}px; left: ${left}px; font-size: 1rem; color: var(--success); text-shadow: 2px 2px 2px #000000;`;
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

    private _name: PokemonNameType;
    private _baseLevel: number;
    private _teamId: TeamType;

    private _level: PureComputed<number> = ko.pureComputed(() => Math.floor(App.game.battleTree.sequence.modifierManager.getValue({ key: 'level', scope: this._teamId, base: this._baseLevel })));
    private _attack: PureComputed<number> = ko.pureComputed(() => Math.floor(App.game.battleTree.sequence.modifierManager.getValue({ key: 'attack', scope: this._teamId, base: statPointFormula(averageStat(pokemonMap[this._name].base.attack, pokemonMap[this._name].base.specialAttack), this.level) })));
    private _defense: PureComputed<number> = ko.pureComputed(() => Math.floor(App.game.battleTree.sequence.modifierManager.getValue({ key: 'defense', scope: this._teamId, base: statPointFormula(averageStat(pokemonMap[this._name].base.defense, pokemonMap[this._name].base.specialDefense), this.level) })));
    private _speed: PureComputed<number> = ko.pureComputed(() => Math.floor(App.game.battleTree.sequence.modifierManager.getValue({ key: 'speed', scope: this._teamId, base: statPointFormula(pokemonMap[this._name].base.speed, this.level) })));
    private _maxHitpoints: PureComputed<number> = ko.pureComputed(() => Math.floor(App.game.battleTree.sequence.modifierManager.getValue({ key: 'max_hitpoints', scope: this._teamId, base: hitPointFormula(pokemonMap[this._name].base.hitpoints, this.level) })));

    private _hp: Observable<number> = ko.observable(0).extend({ numeric: 0 });
    private _shiny: Observable<boolean | undefined> = ko.observable(undefined);
    private _gender: Observable<BattlePokemonGender | undefined> = ko.observable(undefined);

    constructor(properties: BattleTreePokemonProperties) {
        this.uuid = crypto.randomUUID();

        this._name = properties.name;
        this._baseLevel = properties.level;
        this._teamId = properties.team;

        this._hp(this.maxHitpoints);

        this._maxHitpoints.subscribe(function () {
            this._hp(Math.min(this.maxHitpoints, this._hp()));
        }, this, 'spectate');
    }

    public heal(opts: { percentage?: number, flat?: number, allowRevive?: boolean }): void {
        if (!opts.allowRevive && this._hp() === 0) {
            return;
        }

        const p = Math.floor(this._maxHitpoints() * (opts.percentage ?? 0));
        const f = opts.flat ?? 0;

        const total = Math.min(this._maxHitpoints() - this._hp(), p + f);
        this._hp(this._hp() + total);
        animateHeal(this.uuid, total);
    }

    public attackTarget(target: BattleTreePokemon): void {
        const baseDamage = ((2 * this.level / 5 + 2) * this.power * this.attack / target.defense / 50 + 2);

        const attacker = pokemonMap[this._name];
        const defender = pokemonMap[target.name];

        const attackMap: DamageMapType = Object.fromEntries(pokemonMap[attacker.name].type.map(at => [at, Object.fromEntries(pokemonMap[defender.name].type.map(dt => [dt, undefined]))]));
        const damagesCount = attacker.type.length * defender.type.length;

        for (const attackType in attackMap) {
            for (const defenseType in attackMap[attackType]) {
                const effectivenessMultiplier = App.game.battleTree.sequence.modifierManager.getValue({ key: 'type_effectiveness', scope: this._teamId, base: TypeHelper.typeMatrix[attackType][defenseType] });
                const rawDamage = (baseDamage / damagesCount) * effectivenessMultiplier;

                attackMap[attackType][defenseType] = App.game.battleTree.sequence.modifierManager.getValue({ key: 'damage_dealt_after_types', scope: this._teamId, base: rawDamage });
            }
        }

        const actualHitDamage = target.takeDamage(this, this._teamId, attackMap);

        const lifeStealPercentage = App.game.battleTree.sequence.modifierManager.getValue({ key: 'life_steal_percertage', scope: this._teamId, base: 0 });
        const lifeStealAmount = Math.floor(actualHitDamage * lifeStealPercentage);

        if (lifeStealAmount > 0) {
            this.heal({ flat: lifeStealAmount });
        }
    }

    public takeDamage(from: BattleTreePokemon, team: TeamType, damageMap: DamageMapType): number {
        for (const attackType in damageMap) {
            for (const defenseType in damageMap[attackType]) {
                damageMap[attackType][defenseType] = App.game.battleTree.sequence.modifierManager.getValue({ key: 'damage_taken_after_types', scope: this._teamId, base: damageMap[attackType][defenseType] });
            }
        }

        const totalDamage = Object.values(damageMap)
            .flatMap(v => Object.values(v))
            .reduce((cumulative, damage) => cumulative + damage, 0);

        const flooredDamage = Math.floor(totalDamage);

        const actualHitDamage = Math.min(this._hp(), flooredDamage);

        this._hp(Math.max(this._hp() - actualHitDamage, 0));
        animateDamage(this.uuid, actualHitDamage);

        return actualHitDamage;
    }

    get name(): PokemonNameType {
        return this._name;
    }

    get level(): number {
        return this._level();
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

    get shiny(): boolean | undefined {
        return this._shiny();
    }

    set shiny(value: boolean | undefined) {
        this._shiny(value);
    }

    get gender(): BattlePokemonGender | undefined {
        return this._gender();
    }

    set gender(value: BattlePokemonGender | undefined) {
        this._gender(value);
    }

    public toJSON(): BattleTreePokemonSaveData {
        return {
            name: this._name,
            level: this._baseLevel,
            hp: this._hp(),
            ...(this.shiny !== undefined ? { shiny: this.shiny } : { }),
            ...(this.gender !== undefined ? { gender: this.gender } : { }),
        };
    }

    static fromJSON(json: BattleTreePokemonSaveData, team: TeamType): BattleTreePokemon {
        const pokemon: BattleTreePokemon = new BattleTreePokemon({
            name: json.name,
            level: json.level,
            team: team,
        });

        pokemon._hp(json.hp ?? pokemon.maxHitpoints);
        pokemon._shiny(json.shiny);
        pokemon._gender(json.gender);

        return pokemon;
    }
}
