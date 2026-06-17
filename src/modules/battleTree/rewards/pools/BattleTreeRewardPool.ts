import { ItemNameType } from '../../../items/ItemNameType';
import SeededRand from '../../../utilities/SeededRand';
import Rand from '../../../utilities/Rand';
import Requirement from '../../../requirements/Requirement';

export type BattleTreeRewardPoolNameType = 'generic' | 'mega_rare' | 'special_ball' | 'currency' | 'evo_items' | 'shadow_mewtwo' | 'venustoise' | 'gems';

interface BattleTreeRewardPoolEntry {
    item: ItemNameType | BattleTreeRewardPool;
    weight: number;
    amount: {
        min?: number;
        max: number;
    } | (() => number) | number;
    requirement?: Requirement;
}

interface BattleTreeRewardPoolProperties {
    id: BattleTreeRewardPoolNameType;
    entries: BattleTreeRewardPoolEntry[];
}

export interface BattleTreeRewardPoolRollResult {
    item: ItemNameType;
    amount: number;
}

export class BattleTreeRewardPool {
    public readonly id: BattleTreeRewardPoolNameType;
    private _entries: BattleTreeRewardPoolEntry[];

    constructor(properties: BattleTreeRewardPoolProperties) {
        this.id = properties.id;
        this._entries = properties.entries;
    }

    public roll(seed?: number): BattleTreeRewardPoolRollResult {
        const eligibleEntries = this._entries.filter(entry => entry.requirement?.isCompleted() ?? true);

        SeededRand.seed(seed);
        const r: typeof SeededRand = seed ? SeededRand : Rand;
        const pickedEntry = r.fromWeightedArray(eligibleEntries, eligibleEntries.map(v => v.weight));

        if (pickedEntry.item instanceof BattleTreeRewardPool) {
            return pickedEntry.item.roll(seed);
        }

        const resolveAmount: ((entry: BattleTreeRewardPoolEntry) => number) = entry => {
            switch (typeof entry.amount) {
                case 'number': return entry.amount;
                case 'function': return entry.amount();
                case 'object': {
                    const min = Math.max(entry.amount.min ?? 0, 1);
                    const max = Math.max(entry.amount.max ?? 1, 1, min);
                    return r.intBetween(min, max);
                }
            }
        };

        return {
            item: pickedEntry.item,
            amount: resolveAmount(pickedEntry),
        };
    }
}
