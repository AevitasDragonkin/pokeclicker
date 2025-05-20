import { Observable, ObservableArray } from 'knockout';
import { ItemNameType } from '../items/ItemNameType';

export class BattleTreeReward {
    private readonly _item: ItemNameType;
    private readonly _amount: Observable<number>;

    constructor(item: ItemNameType, amount: number = 0) {
        this._item = item;
        this._amount = ko.observable(amount ?? 0);
    }

    get item(): ItemNameType {
        return this._item;
    }

    get amount(): number {
        return this._amount();
    }

    set amount(value: number) {
        this._amount(value);
    }

    toJSON(): Record<string, any> {
        return {
            item: this.item,
            amount: this.amount,
        };
    }

    static fromJSON(json): BattleTreeReward {
        return new BattleTreeReward(json.item, json.amount);
    }
}

export class BattleTreeRewards {
    private static _rewards: Map<string, ObservableArray<BattleTreeReward>> = new Map();

    public static getRewardList(runID: string): ObservableArray<BattleTreeReward> {
        return this._rewards.get(runID) ?? this._rewards.set(runID, ko.observableArray()).get(runID);
    }

    public static addReward(runID: string, reward: ItemNameType, amount: number): void {
        const existing = this.getRewardList(runID)().find(r => r.item === reward);

        if (existing) {
            existing.amount += amount;
        } else {
            this.getRewardList(runID).push(new BattleTreeReward(reward, amount));
        }
    }
}
