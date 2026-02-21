import {
    BattleTreeProgressionRewardDefinition,
    BattleTreeProgressionRewardNameType,
    BattleTreeProgressionRewards,
} from './progression/BattleTreeProgressionRewards';
import { ItemList } from '../../items/ItemList';
import { ObservableArray } from 'knockout';
import { BattleTreeProgressionRewardRecurrence } from '../types';

interface BattleTreeRewardManagerSaveData {
    data: Record<BattleTreeProgressionRewardRecurrence, BattleTreeProgressionRewardNameType[]>;
}

export class BattleTreeRewardManager {
    private _claimedRewards: Record<BattleTreeProgressionRewardRecurrence, ObservableArray<BattleTreeProgressionRewardNameType>>;

    constructor() {
        this._claimedRewards = {
            once: ko.observableArray(),
            per_seed: ko.observableArray(),
        };
    }

    public clearClaimedRewards(recurrence: BattleTreeProgressionRewardRecurrence) {
        this._claimedRewards[recurrence].removeAll();
    }

    public claimRewardById(id: BattleTreeProgressionRewardNameType) {
        const result = BattleTreeProgressionRewards.find(value => value.id === id);
        if (result) {
            this.claimReward(result);
        }
    }

    public claimReward(definition: BattleTreeProgressionRewardDefinition) {
        if (!this.canClaimReward(definition)) return;

        ItemList[definition.item].gain(definition.amount);

        this._claimedRewards[definition.recurrence].push(definition.id);
    }

    public hasRequirement(definition: BattleTreeProgressionRewardDefinition): boolean {
        return definition.requirement && !definition.requirement.isCompleted() && !this.hasClaimedReward(definition);
    }

    public hasClaimedReward(definition: BattleTreeProgressionRewardDefinition): boolean {
        return this._claimedRewards[definition.recurrence]().includes(definition.id);
    }

    public canClaimReward(definition: BattleTreeProgressionRewardDefinition) {
        if (definition.requirement && !definition.requirement.isCompleted()) return false;

        if (this.hasClaimedReward(definition)) return false;

        return true;
    }

    public toJSON(): BattleTreeRewardManagerSaveData {
        return {
            data: Object.fromEntries(
                Object.entries(this._claimedRewards).map(([key, value]) => [key as BattleTreeProgressionRewardRecurrence, value()]),
            ) as Record<BattleTreeProgressionRewardRecurrence, BattleTreeProgressionRewardNameType[]>,
        };
    }

    public fromJSON(json: BattleTreeRewardManagerSaveData): void {
        Object.keys(this._claimedRewards).forEach(key => {
            this._claimedRewards[key](json.data[key] ?? []);
        });
    }
}
