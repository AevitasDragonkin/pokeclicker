import { BattleTreeRewardPool, BattleTreeRewardPoolNameType } from './BattleTreeRewardPool';

export const BattleTreeRewardPools: Partial<Record<BattleTreeRewardPoolNameType, BattleTreeRewardPool>> = {
    generic: new BattleTreeRewardPool({
        id: 'generic',
        entries: [
            { item: 'Pokeball', weight: 100, amount: { min: 5, max: 10 } },
            { item: 'Greatball', weight: 50, amount: { min: 2, max: 5 } },
            { item: 'Ultraball', weight: 10, amount: { min: 1, max: 3 } },
            { item: 'Masterball', weight: 1, amount: 1 },
            { item: new BattleTreeRewardPool({
                id: 'mega_rare',
                entries: [
                    { item: 'Heat_rock', weight: 99, amount: 1 },
                    { item: 'Heat_rock', weight: 1, amount: 1000 },
                ],
            }), weight: 1, amount: 1 },
        ],
    }),
    special_ball: new BattleTreeRewardPool({
        id: 'special_ball',
        entries: [
            { item: 'Fastball', weight: 1, amount: 1 },
            { item: 'Quickball', weight: 1, amount: 1 },
            { item: 'Timerball', weight: 1, amount: 1 },
            { item: 'Duskball', weight: 1, amount: 1 },
            { item: 'Luxuryball', weight: 1, amount: 1 },
            { item: 'Diveball', weight: 1, amount: 1 },
            { item: 'Lureball', weight: 1, amount: 1 },
            { item: 'Nestball', weight: 1, amount: 1 },
            { item: 'Repeatball', weight: 1, amount: 1 },
            { item: 'Beastball', weight: 1, amount: 1 },
            { item: 'Moonball', weight: 1, amount: 1 },
        ],
    }),
};
