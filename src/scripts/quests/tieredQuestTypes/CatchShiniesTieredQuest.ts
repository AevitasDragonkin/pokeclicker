/// <reference path="../TieredQuest.ts" />

class CatchShiniesTieredQuest extends TieredQuest implements QuestInterface {
    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier()) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = App.game.statistics.totalShinyPokemonCaptured;
    }

    public static generateData(): any[] {
        const pointsRewardPerSingleAmount = super.randomizeReward(GameConstants.SHINY_BASE_REWARD);

        const amount: {[key in QuestTier]: number} = {
            Easy: 1,
            Medium: SeededRand.intBetween(5, 25),
            Hard: SeededRand.intBetween(10, 50),
            Insane: SeededRand.intBetween(40, 100),
        };

        return [amount, pointsRewardPerSingleAmount];
    }

    get description(): string {
        return this.customDescription ?? `Catch ${this.amount().toLocaleString('en-US')} shiny Pokémon.`;
    }

    toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            name: this.constructor.name,
        };
    }
}
