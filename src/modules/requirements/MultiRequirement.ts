import * as GameConstants from '../GameConstants';
import Requirement from './Requirement';

export default class MultiRequirement extends Requirement {
    constructor(public requirements: (Requirement)[] = []) {
        super(requirements.length, GameConstants.AchievementOption.more);
    }

    public isCompleted() {
        return this.requirements.every((requirement) => requirement.isCompleted());
    }

    public hint(): string {
        const output = [];
        this.requirements.forEach((requirement) => {
            if (!requirement.isCompleted()) {
                output.push(requirement.hint().replace(/\./g, ''));
            }
        });
        return `${output.join(' and ')}.`;
    }

    public htmlHint(): string {
        const subReqs = this.requirements.map(req => (`<li class="${req.isCompleted() ? 'text-success' : ''}">${req.htmlHint()}</li>`));

        return `Requires all of the following (${this.requirements.filter(r => r.isCompleted()).length}/${this.requirements.length}):<ul>${subReqs.join('')}</ul>`;
    }

    public getProgress() {
        const completed = this.requirements.filter((requirement) => requirement.isCompleted()).length;
        return Math.min(completed, this.requiredValue);
    }
}
