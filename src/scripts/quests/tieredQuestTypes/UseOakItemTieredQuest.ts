/// <reference path="../TieredQuest.ts" />

class UseOakItemTieredQuest extends TieredQuest implements QuestInterface {
    private item: OakItemType;

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier(), item: OakItemType) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.item = item;
        this.focus = App.game.statistics.oakItemUses[this.item];
    }

    public static generateData(): any[] {
        const options = [
            OakItemType.Magic_Ball,
            OakItemType.Amulet_Coin,
            OakItemType.Exp_Share,
        ];

        const oakItem =  SeededRand.fromArray(options);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(100, 500),
            Medium: SeededRand.intBetween(250, 12500),
            Hard: SeededRand.intBetween(5000, 25000),
            Insane: SeededRand.intBetween(10000, 50000),
        };

        const pointsRewardPerSingleAmount = super.randomizeReward(GameConstants.USE_OAK_ITEM_BASE_REWARD);

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier(), oakItem];
    }

    get description(): string {
        if (this.customDescription) {
            return this.customDescription;
        }
        const desc = [];
        desc.push(`Equip the ${GameConstants.humanifyString(OakItemType[this.item])} and`);
        if (this.item == OakItemType.Magic_Ball) {
            desc.push(`capture ${this.amount().toLocaleString('en-US')} wild Pokémon.`);
        } else if (this.item == OakItemType.Amulet_Coin) {
            desc.push(`earn Pokédollars ${this.amount().toLocaleString('en-US')} times.`);
        } else if (this.item == OakItemType.Exp_Share) {
            desc.push(`defeat ${this.amount().toLocaleString('en-US')} Pokémon.`);
        } else {
            desc.push(`gain its benefit ${this.amount().toLocaleString('en-US')} times.`);
        }
        return desc.join(' ');
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        json.data.push(this.item);
        return json;
    }
}
