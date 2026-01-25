import { ItemNameType } from '../items/ItemNameType';
import { Observable } from 'knockout';

interface BattleTreeRewardProperties {
    item: ItemNameType;
    amount?: number;
}

interface BattleTreeRewardSaveData {
    item: ItemNameType;
    amount: number;
}

export class BattleTreeReward {
    private readonly _item: ItemNameType;
    private readonly _amount: Observable<number>;

    constructor(properties: BattleTreeRewardProperties) {
        this._item = properties.item;
        this._amount = ko.observable(properties.amount ?? 0);
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

    public toJSON(): BattleTreeRewardSaveData {
        return {
            item: this._item,
            amount: this._amount(),
        };
    }

    public static fromJSON(json: BattleTreeRewardSaveData): BattleTreeReward {
        return new BattleTreeReward({
            item: json.item,
            amount: json.amount,
        });
    }
}
