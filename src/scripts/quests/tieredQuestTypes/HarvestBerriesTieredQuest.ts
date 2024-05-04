/// <reference path="../TieredQuest.ts" />

class HarvestBerriesTieredQuest extends TieredQuest implements QuestInterface {

    private berryType: BerryType;

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier(), berryType: BerryType) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.berryType = berryType;
        this.focus = App.game.statistics.berriesHarvested[this.berryType];
    }

    public static generateData(): any[] {
        // Getting available Berries (always include Gen 1 Berries)
        const availableBerries = App.game.farming.berryData.filter(berry => (App.game.farming.unlockedBerries[berry.type]() && berry.growthTime[3] < 12000) || berry.type < BerryType.Persim);
        const berry = SeededRand.fromArray(availableBerries);

        const maxAmt = Math.min(300, Math.ceil(432000 / berry.growthTime[3]));
        const minAmt = Math.min(10, Math.ceil(maxAmt / 2));

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(minAmt, maxAmt),
            Medium: SeededRand.intBetween(minAmt, maxAmt),
            Hard: SeededRand.intBetween(minAmt, maxAmt),
            Insane: SeededRand.intBetween(minAmt, maxAmt),
        };

        const harvestTime = App.game.farming.berryData[berry.type].growthTime[3];
        const harvestAmt = Math.max(4, Math.ceil(App.game.farming.berryData[berry.type].harvestAmount / 2));
        const plantAmt = 1 / harvestAmt;
        const fieldAmt = plantAmt / App.game.farming.plotList.length;
        const reward = Math.ceil(fieldAmt * Math.pow(harvestTime, .7) * 30);
        const pointsRewardPerSingleAmount = super.randomizeReward(reward);

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier(), berry.type];
    }

    get description(): string {
        return this.customDescription ?? `Harvest ${this.amount().toLocaleString('en-US')} ${BerryType[this.berryType]} ${GameConstants.pluralizeString('Berry', this.amount())} at the farm.`;
    }

    toJSON(): Record<string, any> {
        const json = super.toJSON();
        json.name = this.constructor.name;
        json.data.push(this.berryType);
        return json;
    }
}
