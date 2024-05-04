enum QuestTierEnum {
    Easy,
    Medium,
    Hard,
    Insane,
}

type QuestTier = keyof typeof QuestTierEnum;

abstract class TieredQuest extends Quest {
    amounts: {[key in QuestTier]: number};
    pointsRewardPerSingleAmount: number;

    tier: KnockoutObservable<QuestTier>;

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier) {
        super(amounts[tier], Math.ceil(amounts[tier] * pointsRewardPerSingleAmount));

        this.amounts = amounts;
        this.pointsRewardPerSingleAmount = pointsRewardPerSingleAmount;

        this.tier = ko.observable(tier);
    }

    public static randomizeReward(pointsReward: number) {
        const randomPointBonus = 0.9 + SeededRand.float(0.2); // random between 0.9 and 1.1
        return pointsReward * randomPointBonus;
    }

    get xpReward(): number {
        return 100 + (this.pointsReward() / 10);
    }

    public changeQuestTier(tier: QuestTier) {
        if (!this.inProgress() && !this.isCompleted()) {
            this.tier(tier);

            this.amount(this.amounts[tier]);
            this.pointsReward(Math.ceil(this.amount() * this.pointsRewardPerSingleAmount));

            console.log(`Changing tier for ${this.description} to ${this.tier()}, amount = ${this.amount}, points = ${this.pointsReward}`);
        } else {
            Notifier.notify({
                message: 'You cannot change the tier of a quest in progress.',
                type: NotificationConstants.NotificationOption.danger,
            });
        }
    }

    toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            data: <any[]>[this.amounts, this.pointsRewardPerSingleAmount, this.tier()],
        };
    }

    fromJSON(json: any) {
        super.fromJSON(json);
    }
}
