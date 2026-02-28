import Requirement from '../../../requirements/Requirement';
import { BattleTreeHighestStageRequirement, BattleTreeLevelRequirement } from '../../requirements/BattleTreeRequirements';
import { ItemNameType } from '../../../items/ItemNameType';
import { BattleTreeRecurrence } from '../../types';

export type BattleTreeProgressionRewardNameType =
    | 'level:100:MB'
    | 'per_seed:power_bracer'
    | 'per_seed:battle_points'
    | 'per_seed:key_stone'
    | 'per_seed:beast_balls'
    | 'per_seed:stage:10:GB'
    | 'per_sequence:magnets'
    | 'per_sequence:evo';

export interface BattleTreeProgressionRewardDefinition {
    id: BattleTreeProgressionRewardNameType;
    recurrence: BattleTreeRecurrence,
    requirement?: Requirement;
    // reward: { kind: 'item', item: ItemNameType, amount: number } | { kind: 'loot', pool: BattleTreeRewardPoolNameType };
    item: ItemNameType;
    amount: number;
    immediate?: boolean;
}

const AllTimeProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
    { id: 'level:100:MB', recurrence: 'once', requirement: new BattleTreeLevelRequirement(100), item: 'Masterball', amount: 1 },
];

const PerSeedProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
    { id: 'per_seed:power_bracer', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(25, 'per_seed'), item: 'Power_Bracer', amount: 3 },
    { id: 'per_seed:battle_points', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(50, 'per_seed'), item: 'Battle Point', amount: 5000 },
    { id: 'per_seed:key_stone', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(75, 'per_seed'), item: 'Key_stone', amount: 1 },
    { id: 'per_seed:beast_balls', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(100, 'per_seed'), item: 'Beastball', amount: 100 },
];

const PerSequenceProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
    { id: 'per_sequence:evo', recurrence: 'per_sequence', requirement: new BattleTreeHighestStageRequirement(10, 'per_sequence'), item: 'Evolution Item Pool', amount: 3, immediate: true },
];

export const BattleTreeProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
    ...AllTimeProgressionRewards,
    ...PerSeedProgressionRewards,
    ...PerSequenceProgressionRewards,
    // { id: 'level:100:MB', recurrence: 'once', requirement: new BattleTreeLevelRequirement(100), reward: { kind: 'item', item: 'Masterball', amount: 1 } },
    // { id: 'per_seed:stage:10:GB', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(10, 'per_seed'), reward: { kind: 'item', item: 'Greatball', amount: 10 } },

    // { id: 'per_sequence:stage:1:RPB', recurrence: 'per_sequence', requirement: new BattleTreeHighestStageRequirement(1, 'per_sequence'), item: 'Repeatball', amount: 1 },
];
