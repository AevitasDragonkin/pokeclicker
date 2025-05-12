import Requirement from '../requirements/Requirement';
import { AchievementOption } from '../GameConstants';

export class BattleTreeStageRequirement extends Requirement {
    constructor(requiredStage: number) {
        super(requiredStage, AchievementOption.more);
    }

    getProgress(): number {
        return Math.min(App.game.battleTree.currentRun?.stage ?? 0, this.requiredValue);
    }

    hint(): string {
        return `Requires stage ${this.requiredValue}`;
    }
}
