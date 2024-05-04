/// <reference path="../TieredQuest.ts" />

class GainTokensTieredQuest extends TieredQuest implements QuestInterface {

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier()) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = App.game.statistics.totalDungeonTokens;
    }

    public static generateData(): any[] {
        const highestRegion = player.highestRegion();
        const dungeonAmount = Object.values(dungeonList).reduce((max, dungeon) => {
            if (App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(dungeon.name)]()) {
                return Math.max(max, dungeon.tokenCost);
            }
            return max;
        }, 0) || dungeonList[GameConstants.KantoDungeons[0]].tokenCost;
        const baseAmount = dungeonAmount;
        const maxAmount = Math.ceil(baseAmount * (3 + highestRegion));
        const pointsRewardPerSingleAmount = this.randomizeReward(1 / baseAmount * GameConstants.GAIN_TOKENS_BASE_REWARD);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(baseAmount, maxAmount),
            Medium: SeededRand.intBetween(baseAmount * 25, maxAmount * 25),
            Hard: SeededRand.intBetween(baseAmount * 50, maxAmount * 50),
            Insane: SeededRand.intBetween(baseAmount * 100, maxAmount * 100),
        };

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier()];
    }

    get description(): string {
        return this.customDescription ?? `Gain ${this.amount().toLocaleString('en-US')} Dungeon Tokens.`;
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        return json;
    }
}
