import PokemonType from '../enums/PokemonType';
import { ObservableArray } from 'knockout';
import { Currency } from '../GameConstants';
import { ItemNameType } from '../items/ItemNameType';

/* eslint-disable @typescript-eslint/no-shadow */
export enum BattleTreeRewardType {
    Gem = 'Gem',
    Currency = 'Currency',
    Item = 'Item',
}
/* eslint-enable @typescript-eslint/no-shadow */

type BattleTreeBaseReward = {
    amount: number;
};

type BattleTreeGemReward = {
    type: BattleTreeRewardType.Gem;
    gemType: PokemonType;
} & BattleTreeBaseReward;

type BattleTreeCurrencyReward = {
    type: BattleTreeRewardType.Currency;
    currency: Currency;
} & BattleTreeBaseReward;

type BattleTreeItemReward = {
    type: BattleTreeRewardType.Item;
    item: ItemNameType;
} & BattleTreeBaseReward;

type BattleTreeReward = BattleTreeGemReward | BattleTreeCurrencyReward | BattleTreeItemReward;

export class BattleTreeRewards {
    private static _rewards: Map<string, ObservableArray<BattleTreeReward>> = new Map();

    public static getRewardList(runID: string): ObservableArray<BattleTreeReward> {
        return this._rewards.get(runID) ?? this._rewards.set(runID, ko.observableArray()).get(runID);
    }

    public static addReward(runID: string, reward: BattleTreeReward): void {
        const existingReward = this.getRewardList(runID)()
            .filter(r => r.type === reward.type)
            .find(r => {
                switch (r.type) {
                    case BattleTreeRewardType.Gem: return r.gemType === (reward as BattleTreeGemReward).gemType;
                    case BattleTreeRewardType.Currency: return r.currency === (reward as BattleTreeCurrencyReward).currency;
                    case BattleTreeRewardType.Item: return r.item === (reward as BattleTreeItemReward).item;
                }
            });

        if (existingReward) {
            existingReward.amount += reward.amount;
        } else {
            this.getRewardList(runID).push(reward);
        }
    }
}
