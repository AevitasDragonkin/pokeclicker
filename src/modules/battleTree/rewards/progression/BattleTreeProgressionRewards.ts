import Requirement from '../../../requirements/Requirement';
import { BattleTreeHighestStageRequirement, BattleTreeLevelRequirement } from '../../requirements/BattleTreeRequirements';
import { ItemNameType } from '../../../items/ItemNameType';
import { BattleTreeRecurrence } from '../../types';

export type BattleTreeProgressionRewardNameType = 'level:100:MB' | 'per_seed:beast_balls' | 'per_seed:stage:10:GB' | 'per_sequence:magnets';

export interface BattleTreeProgressionRewardDefinition {
    id: BattleTreeProgressionRewardNameType;
    recurrence: BattleTreeRecurrence,
    requirement?: Requirement;
    // reward: { kind: 'item', item: ItemNameType, amount: number } | { kind: 'loot', pool: BattleTreeRewardPoolNameType };
    item: ItemNameType;
    amount: number;
}

const AllTimeProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
    { id: 'level:100:MB', recurrence: 'once', requirement: new BattleTreeLevelRequirement(100), item: 'Masterball', amount: 1 },
];

const PerSeedProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
    { id: 'per_seed:stage:10:GB', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(10, 'per_seed'), item: 'Greatball', amount: 10 },
    { id: 'per_seed:beast_balls', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(100, 'per_seed'), item: 'Beastball', amount: 100 },
];

const PerSequenceProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
    { id: 'per_sequence:magnets', recurrence: 'per_sequence', requirement: new BattleTreeHighestStageRequirement(6, 'per_sequence'), item: 'Magnet', amount: 10 },
];

export const BattleTreeProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
    ...AllTimeProgressionRewards,
    ...PerSeedProgressionRewards,
    ...PerSequenceProgressionRewards,
    // { id: 'level:100:MB', recurrence: 'once', requirement: new BattleTreeLevelRequirement(100), reward: { kind: 'item', item: 'Masterball', amount: 1 } },
    // { id: 'per_seed:stage:10:GB', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(10, 'per_seed'), reward: { kind: 'item', item: 'Greatball', amount: 10 } },

    // { id: 'per_sequence:stage:1:RPB', recurrence: 'per_sequence', requirement: new BattleTreeHighestStageRequirement(1, 'per_sequence'), item: 'Repeatball', amount: 1 },
];
