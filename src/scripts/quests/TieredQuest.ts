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
        super(amounts[tier], amounts[tier] * pointsRewardPerSingleAmount);

        this.amounts = amounts;
        this.pointsRewardPerSingleAmount = pointsRewardPerSingleAmount;

        this.tier = ko.observable(tier);
    }

    get xpReward(): number {
        console.warn('TODO: IMPLEMENT TIERED QUEST XP');
        return this.amounts[this.tier()];
    }

    public consoleLog() {
        console.log('TESTING TIERED QUEST LOG');
        console.log(this.description);
    }

    public changeQuestTier(tier: QuestTier) {
        if (!this.inProgress() && !this.isCompleted()) {
            this.tier(tier);

            this.amount(this.amounts[tier]);
            this.pointsReward(this.amount() * this.pointsRewardPerSingleAmount);

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
            // amounts: this.amounts,
            // pointsRewardPerSingleAmount: this.pointsRewardPerSingleAmount,
            // tier: this.tier(),
        };
    }

    fromJSON(json: any) {
        super.fromJSON(json);

        // this.amounts = json.hasOwnProperty('amounts') ? json.amounts : {};
        // this.pointsRewardPerSingleAmount = json.hasOwnProperty('pointsRewardPerSingleAmount') ? json.pointsRewardPerSingleAmount : 0;
        // this.tier(json.hasOwnProperty('tier') ? json.tier : QuestHelper.defaultQuestTier());
    }
}
