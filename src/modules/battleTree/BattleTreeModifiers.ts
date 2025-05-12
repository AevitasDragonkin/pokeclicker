import { ObservableArray } from 'knockout';
import {
    BattleTreeModifier,
    BattleTreeModifierEffectTarget,
    BattleTreeModifierEffectType,
    BattleTreeModifierImpact,
    BattleTreeModifierRarity,
} from './BattleTreeModifier';

export const MODIFIER_LIST: BattleTreeModifier[] = [
    new BattleTreeModifier({
        id: '001',
        name: 'Attack',
        description: '+10 Attack',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Additive, value: 10, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: '002',
        name: 'Defense',
        description: '+10 Defense',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'defense', type: BattleTreeModifierEffectType.Additive, value: 10, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: '003',
        name: 'Hitpoints',
        description: '+10 Max Hitpoints',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'max-hitpoints', type: BattleTreeModifierEffectType.Additive, value: 10, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: '004',
        name: 'Super attack',
        description: 'Increase Attack by 10%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Multiplicative, value: 1.1, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: '005',
        name: 'Super defense',
        description: 'Increase Defense by 10%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'defense', type: BattleTreeModifierEffectType.Multiplicative, value: 1.1, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: '006',
        name: 'Super HP',
        description: 'Increase Max Hitpoints by 10%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'max-hitpoints', type: BattleTreeModifierEffectType.Multiplicative, value: 1.1, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: '007',
        name: 'Heal',
        description: 'Heal 10%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Common,
        instantEffects: [
            run => run.teamA.forEach(p => p.heal(Math.floor(p.maxHP * 0.1))),
        ],
    }),
    new BattleTreeModifier({
        id: '008',
        name: 'Super Heal',
        description: 'Heal 20%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Rare,
        instantEffects: [
            run => run.teamA.forEach(p => p.heal(Math.floor(p.maxHP * 0.2))),
        ],
    }),
    new BattleTreeModifier({
        id: '009',
        name: 'Mega Heal',
        description: 'Heal 50%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Epic,
        instantEffects: [
            run => run.teamA.forEach(p => p.heal(Math.floor(p.maxHP * 0.5))),
        ],
    }),
    new BattleTreeModifier({
        id: '010',
        name: 'Ultra Heal',
        description: 'Heal 100%',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Epic,
        instantEffects: [
            run => run.teamA.forEach(p => p.heal(p.maxHP)),
        ],
    }),
    new BattleTreeModifier({
        id: '011',
        name: "Tactician's Insight",
        description: 'Double XP, No rewards',
        impact: BattleTreeModifierImpact.Neutral,
        rarity: BattleTreeModifierRarity.Epic,
        effects: [
            { source: 'experience', type: BattleTreeModifierEffectType.Multiplicative, value: 2 },
            { source: 'reward-tokens', type: BattleTreeModifierEffectType.Multiplicative, value: 0 },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: '012',
        name: 'Trainer Discipline',
        description: 'Double rewards, No XP',
        impact: BattleTreeModifierImpact.Neutral,
        rarity: BattleTreeModifierRarity.Epic,
        effects: [
            { source: 'reward-tokens', type: BattleTreeModifierEffectType.Multiplicative, value: 2 },
            { source: 'experience', type: BattleTreeModifierEffectType.Multiplicative, value: 0 },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: '013',
        name: 'Adrenaline Rush',
        description: 'All pokemon attack x1.5 faster',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'attacks-per-second', type: BattleTreeModifierEffectType.Multiplicative, value: 1.5 },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: '014',
        name: 'Swift Command',
        description: 'All pokemon attack x2.5 faster',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'attacks-per-second', type: BattleTreeModifierEffectType.Multiplicative, value: 2.5 },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: '015',
        name: 'Overdrive Engine',
        description: 'All pokemon attack x5 faster',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Epic,
        effects: [
            { source: 'attacks-per-second', type: BattleTreeModifierEffectType.Multiplicative, value: 5 },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: '016',
        name: 'Time Distortion',
        description: 'All pokemon attack x10 faster',
        impact: BattleTreeModifierImpact.Positive,
        rarity: BattleTreeModifierRarity.Legendary,
        effects: [
            { source: 'attacks-per-second', type: BattleTreeModifierEffectType.Multiplicative, value: 10 },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: '017',
        name: 'Glass Cannon',
        description: 'Triple Attack, set Defense to 0',
        impact: BattleTreeModifierImpact.Neutral,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Multiplicative, value: 3, target: BattleTreeModifierEffectTarget.Player },
            { source: 'defense', type: BattleTreeModifierEffectType.Set, value: 0, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: '018',
        name: 'Pressure Build',
        description: 'Enemies gain +5 Attack and +5 Defense for every stage',
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Additive, value: run => run.stage * 5, target: BattleTreeModifierEffectTarget.Enemy },
            { source: 'defense', type: BattleTreeModifierEffectType.Additive, value: run => run.stage * 5, target: BattleTreeModifierEffectTarget.Enemy },
        ],
        limit: 1,
    }),
    new BattleTreeModifier({
        id: '019',
        name: 'Heavy Hand',
        description: 'Enemies deal +10 damage.',
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'damage', type: BattleTreeModifierEffectType.Additive, value: 10, target: BattleTreeModifierEffectTarget.Enemy },
        ],
    }),
    new BattleTreeModifier({
        id: '020',
        name: 'Fatigue',
        description: 'Reduce APS by 5% each stage',
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Common,
        effects: [
            { source: 'attacks-per-second', type: BattleTreeModifierEffectType.Multiplicative, value: run => 0.95 ** run.stage, target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
    new BattleTreeModifier({
        id: '021',
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
        id: '022',
        name: 'Enemy growth',
        description: "Enemies gain +1 attack for each second you've spend in combat",
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'attack', type: BattleTreeModifierEffectType.Additive, value: run => run.combatTime, target: BattleTreeModifierEffectTarget.Enemy },
        ],
    }),
    new BattleTreeModifier({
        id: '023',
        name: 'Toxic',
        description: 'Lose 1 Max Hitpoint for each 5 seconds of combat time',
        impact: BattleTreeModifierImpact.Negative,
        rarity: BattleTreeModifierRarity.Rare,
        effects: [
            { source: 'max-hitpoints', type: BattleTreeModifierEffectType.Additive, value: run => -1 * Math.floor(run.combatTime / 5), target: BattleTreeModifierEffectTarget.Player },
        ],
    }),
];

export class BattleTreeModifiers {
    private static modifiers: Map<string, ObservableArray<BattleTreeModifier>> = new Map();

    public static getModifierList(runID: string): ObservableArray<BattleTreeModifier> {
        return this.modifiers.get(runID) ?? this.modifiers.set(runID, ko.observableArray()).get(runID);
    }

    public static addModifier(runID: string, modifierID: string): BattleTreeModifier | undefined {
        const modifier = MODIFIER_LIST.find(mod => mod.id === modifierID);
        if (modifier) {
            this.getModifierList(runID).push(modifier);
        }
        return modifier;
    }
}
