/// <reference path="../TieredQuest.ts" />

class GainFarmPointsTieredQuest extends TieredQuest implements QuestInterface {

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier()) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = App.game.statistics.totalFarmPoints;
    }

    public static canComplete() {
        return App.game.farming.canAccess();
    }

    public static generateData(): any[] {
        const pointsRewardPerSingleAmount = super.randomizeReward(GameConstants.GAIN_FARM_POINTS_BASE_REWARD);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(500, 5000),
            Medium: SeededRand.intBetween(12500, 125000),
            Hard: SeededRand.intBetween(25000, 250000),
            Insane: SeededRand.intBetween(50000, 500000),
        };

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier()];
    }

    get description(): string {
        return this.customDescription ?? `Gain ${this.amount().toLocaleString('en-US')} Farm Points.`;
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        return json;
    }
}
