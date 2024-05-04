/// <reference path="../TieredQuest.ts" />

class MineLayersTieredQuest extends TieredQuest implements QuestInterface {

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier()) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = App.game.statistics.undergroundLayersMined;
    }

    public static canComplete() {
        return App.game.underground.canAccess();
    }

    public static generateData(): any[] {
        const pointsRewardPerSingleAmount = super.randomizeReward(GameConstants.MINE_LAYERS_BASE_REWARD);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(1, 3),
            Medium: SeededRand.intBetween(25, 75),
            Hard: SeededRand.intBetween(50, 150),
            Insane: SeededRand.intBetween(100, 300),
        };

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier()];
    }

    get description(): string {
        if (this.customDescription) {
            return this.customDescription;
        }
        const suffix = this.amount() > 1 ? 's' : '';
        return `Mine ${this.amount().toLocaleString('en-US')} layer${suffix} in the Underground.`;
    }

    toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            name: this.constructor.name,
        };
    }
}
