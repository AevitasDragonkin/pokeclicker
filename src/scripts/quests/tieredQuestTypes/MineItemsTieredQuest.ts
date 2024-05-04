/// <reference path="../TieredQuest.ts" />

class MineItemsTieredQuest extends TieredQuest implements QuestInterface {

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier()) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = App.game.statistics.undergroundItemsFound;
    }

    public static canComplete() {
        return App.game.underground.canAccess();
    }

    public static generateData(): any[] {
        const pointsRewardPerSingleAmount = super.randomizeReward(GameConstants.MINE_ITEMS_BASE_REWARD);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(3, 15),
            Medium: SeededRand.intBetween(25, 250),
            Hard: SeededRand.intBetween(150, 750),
            Insane: SeededRand.intBetween(300, 1500),
        };

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier()];
    }

    get description(): string {
        if (this.customDescription) {
            return this.customDescription;
        }
        const suffix = this.amount() > 1 ? 's' : '';
        return `Mine ${this.amount().toLocaleString('en-US')} item${suffix} in the Underground.`;
    }

    toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            name: this.constructor.name,
        };
    }
}
