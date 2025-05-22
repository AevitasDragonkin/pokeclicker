import { ObservableArray } from 'knockout';
import {
    BattleTreeModifier,
    BattleTreeModifierEffectTarget,
    BattleTreeModifierEffectType,
    BattleTreeModifierImpact,
    BattleTreeModifierRarity,
} from './BattleTreeModifier';
import { BATTLE_TREE_FORFEIT_REWARD_MULTIPLIER } from '../GameConstants';

export const MODIFIER_LIST: BattleTreeModifier[] = [
    new BattleTreeModifier({
        id: 1,
        name: 'Attack',
        description: '+10 Player Attack',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Additive, value: 10, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: 2,
        name: 'Defense',
        description: '+10 Player Defense',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'defense', type: BattleTreeModifierEffectType.Additive, value: 10, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: 3,
        name: 'Hitpoints',
        description: '+10 Player Max Hitpoints',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'hitpoints', type: BattleTreeModifierEffectType.Additive, value: 10, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: 4,
        name: 'Super attack',
        description: 'Increase Player Attack by 10%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Multiplicative, value: 1.1, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: 5,
        name: 'Super defense',
        description: 'Increase Player Defense by 10%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'defense', type: BattleTreeModifierEffectType.Multiplicative, value: 1.1, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: 6,
        name: 'Super HP',
        description: 'Increase Player Max Hitpoints by 10%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'hitpoints', type: BattleTreeModifierEffectType.Multiplicative, value: 1.1, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: 7,
        name: 'Heal',
        description: 'Instant Heal 10%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Common,
        instantEffects: [
            run => run.teamA.forEach(p => p.heal(Math.floor(p.maxHP * 0.1))),
        ],
    }),
    new BattleTreeModifier({
        id: 8,
        name: 'Super Heal',
        description: 'Instant Heal 20%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Rare,
        instantEffects: [
            run => run.teamA.forEach(p => p.heal(Math.floor(p.maxHP * 0.2))),
        ],
    }),
    new BattleTreeModifier({
        id: 9,
        name: 'Mega Heal',
        description: 'Instant Heal 50%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Epic,
        instantEffects: [
            run => run.teamA.forEach(p => p.heal(Math.floor(p.maxHP * 0.5))),
        ],
    }),
    new BattleTreeModifier({
        id: 10,
        name: 'Ultra Heal',
        description: 'Instant Heal 100%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Epic,
        instantEffects: [
            run => run.teamA.forEach(p => p.heal(p.maxHP)),
        ],
    }),
    new BattleTreeModifier({
        id: 11,
        name: 'Cash In',
        description: 'Double Rewards<br/>End current run',
        impact: BattleTreeModifierImpact.Neutral,
        rarity: BattleTreeModifierRarity.Epic,
        effects: [
            { source: 'reward', type: BattleTreeModifierEffectType.Multiplicative, value: 2 },
        ],
        instantEffects: [
            run => run.handleRunFinished(),
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: 13,
        name: 'Adrenaline Rush',
        description: 'All pokemon attack x1.25 faster',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'attack-delay', type: BattleTreeModifierEffectType.Multiplicative, value: 1 / 1.25 },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: 14,
        name: 'Swift Command',
        description: 'All pokemon attack x1.5 faster',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'attack-delay', type: BattleTreeModifierEffectType.Multiplicative, value: 1 / 1.5 },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: 15,
        name: 'Overdrive Engine',
        description: 'All pokemon attack x1.75 faster',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Epic,
        effects: [
            { source: 'attack-delay', type: BattleTreeModifierEffectType.Multiplicative, value: 1 / 1.75 },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: 16,
        name: 'Time Distortion',
        description: 'All pokemon attack x2 faster',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Legendary,
        effects: [
            { source: 'attack-delay', type: BattleTreeModifierEffectType.Multiplicative, value: 1 / 2 },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: 17,
        name: 'Glass Cannon',
        description: 'Triple Player Attack<br/>Player Defense to 0',
        impact: BattleTreeModifierImpact.Neutral,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Multiplicative, value: 3, target: BattleTreeModifierEffectTarget.Player },
            { source: 'defense', type: BattleTreeModifierEffectType.Set, value: 0, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: 18,
        name: 'Pressure Build',
        description: '+5 Enemy Attack<br/>+5 Enemy Defense<br/>Every stage',
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Additive, value: run => run.stage * 5, target: BattleTreeModifierEffectTarget.Enemy },
            { source: 'defense', type: BattleTreeModifierEffectType.Additive, value: run => run.stage * 5, target: BattleTreeModifierEffectTarget.Enemy },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: 19,
        name: 'Heavy Hand',
        description: '+10 Enemy Damage',
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'damage', type: BattleTreeModifierEffectType.Additive, value: 10, target: BattleTreeModifierEffectTarget.Enemy },
        ],
    }),
    new BattleTreeModifier({
        id: 20,
        name: 'Fatigue',
        description: 'Increase delay between attacks by 1%<br/>Every stage',
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'attack-delay', type: BattleTreeModifierEffectType.Multiplicative, value: run => 1.01 ** run.stage, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: 21,
        name: 'Enrage',
        description: 'Increase attack by party HP% lost',
        impact: BattleTreeModifierImpact.Neutral,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Multiplicative, value: run => 2 - run.teamA.reduce((p, c) => p + c.HP, 0) / run.teamA.reduce((p, c) => p + c.maxHP, 0), target: BattleTreeModifierEffectTarget.Player },
            { source: 'attack', type: BattleTreeModifierEffectType.Multiplicative, value: run => 2 - run.teamB.reduce((p, c) => p + c.HP, 0) / run.teamB.reduce((p, c) => p + c.maxHP, 0), target: BattleTreeModifierEffectTarget.Enemy },
        ],
    }),
    new BattleTreeModifier({
        id: 22,
        name: 'Enemy growth',
        description: '+1 Enemy attack<br/>Every second of combat',
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Additive, value: run => run.combatTime, target: BattleTreeModifierEffectTarget.Enemy },
        ],
    }),
    new BattleTreeModifier({
        id: 23,
        name: 'Toxic',
        description: '-1 Player Max Hitpoints<br/>Every 5 seconds of combat',
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'hitpoints', type: BattleTreeModifierEffectType.Additive, value: run => -1 * Math.floor(run.combatTime / 5), target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
];

const UNPICKABLE_MODIFIER_LIST: BattleTreeModifier[] = [
    new BattleTreeModifier({
        id: -1,
        name: 'Aborted run',
        description: `Reduced rewards by ${(BATTLE_TREE_FORFEIT_REWARD_MULTIPLIER).toLocaleString('en-US', { style: 'percent' })}`,
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'reward', type: BattleTreeModifierEffectType.Multiplicative, value: BATTLE_TREE_FORFEIT_REWARD_MULTIPLIER },
        ],
    }),
];

export class BattleTreeModifiers {
    private static modifiers: Map<string, ObservableArray<BattleTreeModifier>> = new Map();

    public static getModifierList(runID: string): ObservableArray<BattleTreeModifier> {
        return this.modifiers.get(runID) ?? this.modifiers.set(runID, ko.observableArray()).get(runID);
    }

    public static addModifier(runID: string, modifierID: number): BattleTreeModifier | undefined {
        const modifier = [...MODIFIER_LIST, ...UNPICKABLE_MODIFIER_LIST].find(mod => mod.id === modifierID);
        if (modifier) {
            this.getModifierList(runID).push(modifier);
        }
        return modifier;
    }
}
