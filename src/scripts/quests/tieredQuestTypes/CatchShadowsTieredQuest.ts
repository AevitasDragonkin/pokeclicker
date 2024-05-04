/// <reference path="../TieredQuest.ts" />

class CatchShadowsTieredQuest extends TieredQuest implements QuestInterface {
    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier()) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = App.game.statistics.totalShadowPokemonCaptured;
    }

    public static canComplete() {
        return App.game.statistics.totalShadowPokemonCaptured() > 1;
    }

    public static generateData(): any[] {
        const pointsRewardPerSingleAmount = super.randomizeReward(GameConstants.SHADOW_BASE_REWARD);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(1, 5),
            Medium: SeededRand.intBetween(5, 25),
            Hard: SeededRand.intBetween(10, 50),
            Insane: SeededRand.intBetween(40, 100),
        };

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier()];
    }

    get description(): string {
        return this.customDescription ?? `Catch ${this.amount().toLocaleString('en-US')} Shadow Pokémon.`;
    }

    toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            name: this.constructor.name,
        };
    }
}
