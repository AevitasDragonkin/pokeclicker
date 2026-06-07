import Requirement from '../../../requirements/Requirement';
// import {
//     BattleTreeHighestStageRequirement,
//     BattleTreeLevelRequirement,
//     BattleTreeTotalStagesRequirement,
// } from '../../requirements/BattleTreeRequirements';
import { ItemNameType } from '../../../items/ItemNameType';
import { BattleTreeRecurrence } from '../../types';
// import MultiRequirement from '../../../requirements/MultiRequirement';
// import ObtainedPokemonRequirement from '../../../requirements/ObtainedPokemonRequirement';

export type BattleTreeProgressionRewardNameType =
    | 'L15:RC'
    | 'L30:RC'
    | 'L50:RC'
    | 'L75:RC'
    | 'L100:RC'
    | 'S75:TS500:lansat'
    | 'S75:TS500:starf'
    | 'per_seed:power_bracer'
    | 'per_seed:battle_points'
    | 'per_seed:key_stone'
    | 'per_seed:beast_balls'
    | 'per_seed:stage:10:GB'
    | 'per_seed:mismagius_illusion'
    | 'per_sequence:magnets'
    | 'per_sequence:evo'
    | 'per_sequence:shadow_mewtwo';

export interface BattleTreeProgressionRewardDefinition {
    id: BattleTreeProgressionRewardNameType;
    recurrence: BattleTreeRecurrence,
    requirement?: Requirement;
    item: ItemNameType;
    amount: number;
    immediate?: boolean;
}

// const AllTimeProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
//     { id: 'L15:RC', recurrence: 'once', requirement: new BattleTreeLevelRequirement(15), item: 'Rare_Candy', amount: 5 },
//     { id: 'L30:RC', recurrence: 'once', requirement: new BattleTreeLevelRequirement(30), item: 'Rare_Candy', amount: 10 },
//     { id: 'L50:RC', recurrence: 'once', requirement: new BattleTreeLevelRequirement(50), item: 'Rare_Candy', amount: 15 },
//     { id: 'L75:RC', recurrence: 'once', requirement: new BattleTreeLevelRequirement(75), item: 'Rare_Candy', amount: 20 },
//     { id: 'L100:RC', recurrence: 'once', requirement: new BattleTreeLevelRequirement(100), item: 'Rare_Candy', amount: 25 },
//     { id: 'S75:TS500:lansat', recurrence: 'once', requirement: new MultiRequirement([new BattleTreeHighestStageRequirement(75, 'once'), new BattleTreeTotalStagesRequirement(500)]), item: 'LansatBerry', amount: 10 },
//     { id: 'S75:TS500:starf', recurrence: 'once', requirement: new MultiRequirement([new BattleTreeHighestStageRequirement(75, 'once'), new BattleTreeTotalStagesRequirement(500)]), item: 'StarfBerry', amount: 10 },
// ];
//
// const PerSeedProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
//     { id: 'per_seed:power_bracer', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(25, 'per_seed'), item: 'Power_Bracer', amount: 3 },
//     { id: 'per_seed:battle_points', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(50, 'per_seed'), item: 'Battle Point', amount: 5000 },
//     { id: 'per_seed:key_stone', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(75, 'per_seed'), item: 'Key_stone', amount: 1 },
//     { id: 'per_seed:beast_balls', recurrence: 'per_seed', requirement: new BattleTreeHighestStageRequirement(100, 'per_seed'), item: 'Beastball', amount: 100 },
//     { id: 'per_seed:mismagius_illusion', recurrence: 'per_seed', requirement: new MultiRequirement([new BattleTreeLevelRequirement(100), new BattleTreeHighestStageRequirement(75, 'per_seed'), new ObtainedPokemonRequirement('Mismagius (Illusion)')]), item: 'Mismagius (Illusion)', amount: 1 },
// ];
//
// const PerSequenceProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
//     { id: 'per_sequence:evo', recurrence: 'per_sequence', requirement: new BattleTreeHighestStageRequirement(10, 'per_sequence'), item: 'Evolution Item Pool', amount: 3, immediate: true },
//     { id: 'per_sequence:shadow_mewtwo', recurrence: 'per_sequence', requirement: new BattleTreeLevelRequirement(100), item: 'Shadow Mewtwo Pool', amount: 1 },
// ];

export const BattleTreeProgressionRewards: BattleTreeProgressionRewardDefinition[] = [
    // ...AllTimeProgressionRewards,
    // ...PerSeedProgressionRewards,
    // ...PerSequenceProgressionRewards,
];
