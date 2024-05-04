/// <reference path="../TieredQuest.ts" />

class ClearBattleFrontierTieredQuest extends TieredQuest implements QuestInterface {

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier()) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = App.game.statistics.battleFrontierTotalStagesCompleted;
    }

    public static canComplete() {
        return App.game.statistics.battleFrontierTotalStagesCompleted() > 1;
    }

    public static generateData(): any[] {
        const pointsRewardPerSingleAmount = super.randomizeReward(GameConstants.DEFEAT_POKEMONS_BASE_REWARD * 8);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(50, 200),
            Medium: SeededRand.intBetween(1250, 5000),
            Hard: SeededRand.intBetween(2500, 10000),
            Insane: SeededRand.intBetween(5000, 20000),
        };

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier()];
    }

    get description(): string {
        const suffix = this.amount() > 1 ? 's' : '';
        return `Clear ${this.amount().toLocaleString('en-US')} Stages in the Battle Frontier.`;
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        return json;
    }
}
