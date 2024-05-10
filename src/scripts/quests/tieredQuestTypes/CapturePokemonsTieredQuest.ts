/// <reference path="../TieredQuest.ts" />

class CapturePokemonsTieredQuest extends TieredQuest implements QuestInterface {
    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier()) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = ko.pureComputed(() => App.game.statistics.totalPokemonCaptured() - App.game.statistics.totalPokemonHatched());
    }

    public static generateData(): any[] {
        const pointsRewardPerSingleAmount = super.randomizeReward(GameConstants.CAPTURE_POKEMONS_BASE_REWARD);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(100, 500),
            Medium: SeededRand.intBetween(2500, 12500),
            Hard: SeededRand.intBetween(5000, 25000),
            Insane: SeededRand.intBetween(10000, 50000),
        };

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier()];
    }

    get description(): string {
        return this.customDescription ?? `Capture ${this.amount().toLocaleString('en-US')} Pokémon.`;
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        return json;
    }
}
