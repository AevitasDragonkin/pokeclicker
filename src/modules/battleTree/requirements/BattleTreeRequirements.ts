import Requirement from '../../requirements/Requirement';
import { AchievementOption } from '../../GameConstants';
import { BattleTreeRecurrence } from '../types';
import { TeamType } from '../BattleTreeSequence';

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

export class BattleTreeStageRequirement extends Requirement {
    constructor(stage: number, option: AchievementOption = AchievementOption.more) {
        super(stage, option);
    }

    getProgress(): number {
        switch (this.option) {
            case AchievementOption.more:
                return Math.min(App.game.battleTree.sequence.stage, this.requiredValue);
            case AchievementOption.less:
                return Math.max(App.game.battleTree.sequence.stage, this.requiredValue);
            case AchievementOption.equal:
                return App.game.battleTree.sequence.stage === this.requiredValue ? 1 : 0;
        }
    }

    hint(): string {
        switch (this.option) {
            case AchievementOption.more:
                return `Needs to reach stage ${this.requiredValue} in the Battle Tree.`;
            case AchievementOption.less:
                return `Needs to stay below stage ${this.requiredValue} in the Battle Tree.`;
            case AchievementOption.equal:
                return `Needs to be on stage ${this.requiredValue} in the Battle Tree.`;
        }
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

export class BattleTreeTeamSizeRequirement extends Requirement {
    private _size: number;
    private _team: TeamType | undefined;

    constructor(size: number, option: AchievementOption, team: TeamType = undefined) {
        super(size, option);
        this._size = size;
        this._team = team;
    }

    getProgress(): number {
        switch (this.option) {
            case AchievementOption.more: {
                switch (this._team) {
                    case 'Team_A': return Math.min(App.game.battleTree.sequence.teams.Team_A.list.length, this.requiredValue);
                    case 'Team_B': return Math.min(App.game.battleTree.sequence.teams.Team_B.list.length, this.requiredValue);
                    default: return Math.min(App.game.battleTree.sequence.teams.Team_A.list.length, App.game.battleTree.sequence.teams.Team_B.list.length, this.requiredValue);
                }
            }
            case AchievementOption.less: {
                switch (this._team) {
                    case 'Team_A': return Math.max(App.game.battleTree.sequence.teams.Team_A.list.length, this.requiredValue);
                    case 'Team_B': return Math.max(App.game.battleTree.sequence.teams.Team_B.list.length, this.requiredValue);
                    default: return Math.max(App.game.battleTree.sequence.teams.Team_A.list.length, App.game.battleTree.sequence.teams.Team_B.list.length, this.requiredValue);
                }
            }
            case AchievementOption.equal: {
                switch (this._team) {
                    case 'Team_A': return App.game.battleTree.sequence.teams.Team_A.list.length === this.requiredValue ? 1 : 0;
                    case 'Team_B': return App.game.battleTree.sequence.teams.Team_B.list.length === this.requiredValue ? 1 : 0;
                    default: return (App.game.battleTree.sequence.teams.Team_A.list.length === this.requiredValue ? 0.5 : 0) +
                        (App.game.battleTree.sequence.teams.Team_B.list.length === this.requiredValue ? 0.5 : 0);
                }
            }
            default: break;
        }

    }

    hint(): string {
        switch (this.option) {
            case AchievementOption.more: {
                switch (this._team) {
                    case 'Team_A': return `Your team needs to have at least ${this.requiredValue} pokemon`;
                    case 'Team_B': return `Your opponent needs to have at least ${this.requiredValue} pokemon`;
                    default: return `Both you and your opponent need to have at least ${this.requiredValue} pokemon`;
                }
            }
            case AchievementOption.less: {
                switch (this._team) {
                    case 'Team_A': return `Your team needs to have at most ${this.requiredValue} pokemon`;
                    case 'Team_B': return `Your opponent needs to have at most ${this.requiredValue} pokemon`;
                    default: return `Both you and your opponent need to have at most ${this.requiredValue} pokemon`;
                }
            }
            case AchievementOption.equal: {
                switch (this._team) {
                    case 'Team_A': return `Your team needs to have exactly ${this.requiredValue} pokemon`;
                    case 'Team_B': return `Your opponent needs to have exactly ${this.requiredValue} pokemon`;
                    default: return `Both you and your opponent need to have exactly ${this.requiredValue} pokemon`;
                }
            }
        }

    }
}

export class BattleTreeModifierSizeRequirement extends Requirement {
    private _size: number;

    constructor(size: number, option: AchievementOption = AchievementOption.more) {
        super(size, option);
        this._size = size;
    }

    getProgress(): number {
        switch (this.option) {
            case AchievementOption.more: return Math.min(App.game.battleTree.sequence.modifierManager.history.length, this.requiredValue);
            case AchievementOption.less: return Math.max(App.game.battleTree.sequence.modifierManager.history.length, this.requiredValue);
            case AchievementOption.equal: return App.game.battleTree.sequence.modifierManager.history.length === this.requiredValue ? 1 : 0;
        }
    }

    hint(): string {
        switch (this.option) {
            case AchievementOption.more: return `You need to have at least ${this.requiredValue} modifiers applied in this Battle Climb.`;
            case AchievementOption.less: return `You need to have at most ${this.requiredValue} modifiers applied in this Battle Climb.`;
            case AchievementOption.equal: return `You need to have exactly ${this.requiredValue} modifiers applied in this Battle Climb.`;
        }
    }
}

export const BattleTreeAutoPickRequirement = new BattleTreeLevelRequirement(50);
export const BattleTreePowerUpLootRequirement = new BattleTreeLevelRequirement(80);
export const BattleTreePowerUpRequirement = new BattleTreeLevelRequirement(100);
