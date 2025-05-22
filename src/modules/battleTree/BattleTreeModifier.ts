import Requirement from '../requirements/Requirement';
import { BattleTreeRun } from './BattleTreeRun';

export type BattleTreeModifierEffectSource = 'level' |
'base-attack' | 'base-defense' | 'base-speed' | 'base-hitpoints' |
'attack' | 'defense' | 'speed' | 'hitpoints' |
'attack-delay' | 'damage' | 'reward' | 'experience';

export enum BattleTreeModifierEffectType {
    Additive,
    Multiplicative,
    Reset,
    Set,
}
export enum BattleTreeModifierRarity {
    Common,
    Rare,
    Epic,
    Legendary,
}
export enum BattleTreeModifierEffectTarget {
    None,
    Player,
    Enemy,
}
export enum BattleTreeModifierImpact {
    Positive,
    Neutral,
    Negative,
}

type InstantEffect = (run: BattleTreeRun) => void;

type BattleTreeModifierEffectProperties = {
    source: BattleTreeModifierEffectSource;
    type: BattleTreeModifierEffectType;
    value: ((run?: BattleTreeRun) => number) | number;
    effectRequirement?: Requirement;
    target?: BattleTreeModifierEffectTarget;
};

type BattleTreeModifierProperties = {
    id: number;
    name: string;
    description: string;
    impact: BattleTreeModifierImpact;
    rarity: BattleTreeModifierRarity;
    effects?: BattleTreeModifierEffectProperties[],
    instantEffects?: InstantEffect[],
    limit?: number;
    unlockRequirement?: Requirement;
};

export const battleTreeModifierWeightMap: { [rarity in BattleTreeModifierRarity]: number } = {
    [BattleTreeModifierRarity.Common]: 100,
    [BattleTreeModifierRarity.Rare]: 30,
    [BattleTreeModifierRarity.Epic]: 10,
    [BattleTreeModifierRarity.Legendary]: 3,
};

export class BattleTreeModifierEffect {
    private readonly _properties: BattleTreeModifierEffectProperties;

    constructor(properties: BattleTreeModifierEffectProperties) {
        this._properties = properties;
    }

    get source(): BattleTreeModifierEffectSource {
        return this._properties.source;
    }

    get target(): BattleTreeModifierEffectTarget {
        return this._properties.target ?? BattleTreeModifierEffectTarget.None;
    }

    get type(): BattleTreeModifierEffectType {
        return this._properties.type;
    }

    get value(): number {
        return typeof this._properties.value === 'function' ? this._properties.value(App.game.battleTree.currentRun) : this._properties.value;
    }
}

export class BattleTreeModifier {
    private readonly _properties: BattleTreeModifierProperties;
    private readonly _effects: BattleTreeModifierEffect[];

    constructor(properties: BattleTreeModifierProperties) {
        this._properties = properties;
        this._effects = properties.effects?.map(effect => new BattleTreeModifierEffect(effect)) || [];
    }

    get id(): number {
        return this._properties.id;
    }

    get name(): string {
        return this._properties.name;
    }

    get description(): string {
        return this._properties.description;
    }

    get impact(): BattleTreeModifierImpact {
        return this._properties.impact;
    }

    get effects(): BattleTreeModifierEffect[] {
        return this._effects ?? [];
    }

    get instantEffects(): InstantEffect[] {
        return this._properties.instantEffects ?? [];
    }

    get limit(): number {
        return this._properties.limit ?? Number.POSITIVE_INFINITY;
    }

    get isUnlocked(): boolean {
        return this._properties.unlockRequirement?.isCompleted() ?? true;
    }

    get hint(): string {
        return this._properties.unlockRequirement?.hint() ?? '';
    }

    get weight(): number {
        return battleTreeModifierWeightMap[this._properties.rarity];
    }
}
