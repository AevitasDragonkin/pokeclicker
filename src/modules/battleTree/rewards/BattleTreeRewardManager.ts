import {
    BattleTreeProgressionRewardDefinition,
    BattleTreeProgressionRewardNameType,
    BattleTreeProgressionRewards,
} from './progression/BattleTreeProgressionRewards';
import { ItemList } from '../../items/ItemList';
import { BattleTreeRecurrence } from '../BattleTree';

interface BattleTreeRewardManagerSaveData {
    data: Record<BattleTreeRecurrence, BattleTreeProgressionRewardNameType[]>;
}

export class BattleTreeRewardManager {
    private _claimedRewards: Record<BattleTreeRecurrence, BattleTreeProgressionRewardNameType[]>;

    constructor() {
        this._claimedRewards = {
            once: [],
            per_seed: [],
            per_sequence: [],
        };
    }

    public clearClaimedRewards(recurrence: BattleTreeRecurrence) {
        this._claimedRewards[recurrence].length = 0;
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
        return this._claimedRewards[definition.recurrence].includes(definition.id);
    }

    public canClaimReward(definition: BattleTreeProgressionRewardDefinition) {
        if (definition.requirement && !definition.requirement.isCompleted()) return false;

        if (this.hasClaimedReward(definition)) return false;

        return true;
    }

    public toJSON(): BattleTreeRewardManagerSaveData {
        return {
            data: this._claimedRewards,
        };
    }

    public fromJSON(json: BattleTreeRewardManagerSaveData): void {
        Object.keys(this._claimedRewards).forEach(key => {
            this._claimedRewards[key] = json.data[key] ?? [];
        });
    }
}
