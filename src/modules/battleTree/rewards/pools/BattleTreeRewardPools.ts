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
};
