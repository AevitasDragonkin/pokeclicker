/// <reference path="../TieredQuest.ts" />

class GainMoneyTieredQuest extends TieredQuest implements QuestInterface {

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier()) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = App.game.statistics.totalMoney;
    }

    public static generateData(): any[] {
        const highestRegion = player.highestRegion();
        const gymAmount = Object.values(GymList).reduce((max, gym) => {
            if (App.game.statistics.gymsDefeated[GameConstants.getGymIndex(gym.town)]()) {
                // 1.3 raised to variable power so we account for gyms from early regions being easier and better for money.
                return Math.max(max, (gym.moneyReward) * 1.3 ** (highestRegion - GameConstants.getGymRegion(gym.town)));
            }
            return max;
        }, 0) || GymList[GameConstants.KantoGyms[0]].moneyReward;
        const baseAmount = gymAmount * (1 + highestRegion) * 2;
        const maxAmount = Math.ceil(baseAmount * (3 + highestRegion));

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(baseAmount, maxAmount),
            Medium: SeededRand.intBetween(baseAmount * 25, maxAmount * 25),
            Hard: SeededRand.intBetween(baseAmount * 50, maxAmount * 50),
            Insane: SeededRand.intBetween(baseAmount * 100, maxAmount * 100),
        };
        const pointsRewardPerSingleAmount = this.randomizeReward(1 / baseAmount * GameConstants.GAIN_MONEY_BASE_REWARD);

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier()];
    }

    get description(): string {
        return this.customDescription ?? `Gain ${this.amount().toLocaleString('en-US')} Pokédollars.`;
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        return json;
    }
}
