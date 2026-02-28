import {
    BattleTreeProgressionRewardDefinition,
    BattleTreeProgressionRewardNameType,
    BattleTreeProgressionRewards,
} from './progression/BattleTreeProgressionRewards';
import { ItemList } from '../../items/ItemList';
import { ObservableArray } from 'knockout';
import { BattleTreeRecurrence } from '../types';

interface BattleTreeRewardManagerSaveData {
    data: Record<BattleTreeRecurrence, BattleTreeProgressionRewardNameType[]>;
}

export class BattleTreeRewardManager {
    private _claimedRewards: Record<BattleTreeRecurrence, ObservableArray<BattleTreeProgressionRewardNameType>>;

    constructor() {
        this._claimedRewards = {
            once: ko.observableArray(),
            per_seed: ko.observableArray(),
            per_sequence: ko.observableArray(),
        };
    }

    public clearClaimedRewards(recurrence: BattleTreeRecurrence) {
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

        if (definition.recurrence === 'per_sequence') {
            if (definition.immediate) {
                ItemList[definition.item].gain(definition.amount);
            } else {
                App.game.battleTree.sequence.addReward(definition.item, definition.amount);
            }
        } else {
            ItemList[definition.item].gain(definition.amount);
        }

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
                Object.entries(this._claimedRewards).map(([key, value]) => [key as BattleTreeRecurrence, value()]),
            ) as Record<BattleTreeRecurrence, BattleTreeProgressionRewardNameType[]>,
        };
    }

    public fromJSON(json: BattleTreeRewardManagerSaveData): void {
        Object.keys(this._claimedRewards).forEach(key => {
            this._claimedRewards[key](json.data[key] ?? []);
        });
    }
}
