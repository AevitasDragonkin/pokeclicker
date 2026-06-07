import Requirement from '../../requirements/Requirement';
import { AchievementOption } from '../../GameConstants';
import { BattleTreeRecurrence } from '../types';

export class BattleTreeLevelRequirement extends Requirement {
    constructor(level: number) {
        super(level, AchievementOption.more);
    }

    getProgress(): number {
        return Math.min(App.game.battleTree.level, this.requiredValue);
    }

    hint(): string {
        return `Needs Battle Tree level ${this.requiredValue}.`;
    }
}

export class BattleTreeHighestStageRequirement extends Requirement {
    private _recurrence: BattleTreeRecurrence;

    constructor(stage: number, recurrence: BattleTreeRecurrence = 'once') {
        super(stage, AchievementOption.more);
        this._recurrence = recurrence;
    }

    getProgress(): number {
        switch (this._recurrence) {
            case 'per_sequence':
                return Math.min(App.game.statistics.battleTreeHighestStageCompletedPerSequence(), this.requiredValue);
            case 'per_seed':
                return Math.min(App.game.statistics.battleTreeHighestStageCompletedPerSeed(), this.requiredValue);
            case 'once':
            default:
                return Math.min(App.game.statistics.battleTreeHighestStageCompleted(), this.requiredValue);
        }
    }

    hint(): string {
        switch (this._recurrence) {
            case 'per_sequence':
                return `Defeat platform ${this.requiredValue} in a Battle Climb (current).`;
            case 'per_seed':
                return `Defeat platform ${this.requiredValue} in a Battle Climb (daily).`;
            case 'once':
            default:
                return `Defeat platform ${this.requiredValue} in a Battle Climb (all-time).`;
        }
    }
}

export class BattleTreeTotalStagesRequirement extends Requirement {
    private _recurrence: BattleTreeRecurrence;

    constructor(stage: number, recurrence: BattleTreeRecurrence = 'once') {
        super(stage, AchievementOption.more);
        this._recurrence = recurrence;
    }

    getProgress(): number {
        switch (this._recurrence) {
            case 'per_sequence':
                return Math.min(App.game.statistics.battleTreeTotalStagesCompletedPerSequence(), this.requiredValue);
            case 'per_seed':
                return Math.min(App.game.statistics.battleTreeTotalStagesCompletedPerSeed(), this.requiredValue);
            case 'once':
            default:
                return Math.min(App.game.statistics.battleTreeTotalStagesCompleted(), this.requiredValue);
        }
    }

    hint(): string {
        switch (this._recurrence) {
            case 'per_sequence':
                return `You need to have completed ${this.requiredValue} platforms in a Battle Climb (current).`;
            case 'per_seed':
                return `You need to have completed ${this.requiredValue} platforms in a Battle Climb (today).`;
            case 'once':
            default:
                return `You need to have completed ${this.requiredValue} platforms in a Battle Climb (all-time).`;
        }
    }
}

export const BattleTreeAutoPickRequirement = new BattleTreeLevelRequirement(50);
export const BattleTreePowerUpLootRequirement = new BattleTreeLevelRequirement(80);
export const BattleTreePowerUpRequirement = new BattleTreeLevelRequirement(100);
