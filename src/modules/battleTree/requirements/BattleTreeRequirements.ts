import Requirement from '../../requirements/Requirement';
import { AchievementOption } from '../../GameConstants';
import OneFromManyRequirement from '../../requirements/OneFromManyRequirement';

export class BattleTreeLevelRequirement extends Requirement {
    constructor(level: number) {
        super(level, AchievementOption.more);
    }

    getProgress(): number {
        return Math.min(App.game.battleTree.level, this.requiredValue);
    }

    hint(): string {
        return `You need level ${this.requiredValue} in the Battle Tree.`;
    }
}

type BattleTreeHighestStageRequirementScope = 'ever' | 'daily' | 'current';
export class BattleTreeHighestStageRequirement extends Requirement {
    private _scope: BattleTreeHighestStageRequirementScope;

    constructor(stage: number, scope: BattleTreeHighestStageRequirementScope = 'ever') {
        super(stage, AchievementOption.more);
        this._scope = scope;
    }

    getProgress(): number {
        switch (this._scope) {
            case 'current':
                return Math.min(App.game.battleTree.sequence.stage, this.requiredValue);
            case 'daily':
                return Math.min(0, this.requiredValue);
            case 'ever':
            default:
                return Math.min(0, this.requiredValue);
        }
    }

    hint(): string {
        switch (this._scope) {
            case 'current':
                return `You need to have reached stage ${this.requiredValue} in your current Battle Tree run.`;
            case 'daily':
                return `You need to have reached a highest stage ${this.requiredValue} in your Battle Tree today.`;
            case 'ever':
            default:
                return `You need to have reached a highest stage ${this.requiredValue} in your Battle Tree, ever.`;
        }
    }
}

export const BattleTreeAutoPickRequirement = new OneFromManyRequirement([
    new BattleTreeLevelRequirement(50),
    new BattleTreeHighestStageRequirement(50)],
);

export const BattleTreePowerUpRequirement = new BattleTreeLevelRequirement(100);
