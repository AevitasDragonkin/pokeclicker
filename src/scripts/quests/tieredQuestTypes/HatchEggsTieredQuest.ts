/// <reference path="../TieredQuest.ts" />

class HatchEggsTieredQuest extends TieredQuest implements QuestInterface {

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier()) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = App.game.statistics.totalPokemonHatched;
    }

    public static canComplete() {
        return App.game.breeding.canAccess();
    }

    public static generateData(): any[] {
        const pointsRewardPerSingleAmount = super.randomizeReward(GameConstants.HATCH_EGGS_BASE_REWARD);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(1, 10),
            Medium: SeededRand.intBetween(50, 250),
            Hard: SeededRand.intBetween(100, 500),
            Insane: SeededRand.intBetween(400, 1000),
        };

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier()];
    }

    get description(): string {
        return this.customDescription ?? `Hatch ${this.amount().toLocaleString('en-US')} ${GameConstants.pluralizeString('Egg', this.amount())}.`;
    }

    toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            name: this.constructor.name,
        };
    }
}
