/// <reference path="../TieredQuest.ts" />

class DefeatGymTieredQuest extends TieredQuest implements QuestInterface {
    private region: GameConstants.Region;

    constructor(
        amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier(),
        public gymTown: string
    ) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.region = GameConstants.getGymRegion(this.gymTown);
        if (this.region == GameConstants.Region.none) {
            throw new Error(`Invalid gym town for quest: ${this.gymTown}`);
        }
        this.focus = App.game.statistics.gymsDefeated[GameConstants.getGymIndex(this.gymTown)];
    }

    // Only add Defeat Gym Quest if the player has defeated the first gym (Brock).
    public static canComplete() {
        return App.game.badgeCase.hasBadge(BadgeEnums.Boulder);
    }

    public static generateData(): any[] {
        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(5, 20),
            Medium: SeededRand.intBetween(20, 100),
            Hard: SeededRand.intBetween(100, 500),
            Insane: SeededRand.intBetween(500, 2000),
        };

        const maxRegion = App.game.badgeCase.hasBadge(GymList[GameConstants.RegionGyms[player.highestRegion()][0]].badgeReward) ? player.highestRegion() : player.highestRegion() - 1;
        const region = SeededRand.intBetween(0, maxRegion);
        // Only use cleared gyms.
        const possibleGyms = GameConstants.RegionGyms[region].filter(gymTown => GymList[gymTown].flags.quest && GymList[gymTown].clears());
        const gymTown = SeededRand.fromArray(possibleGyms);
        const pointsRewardPerSingleAmount = this.calcReward(gymTown);

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier(), gymTown];
    }

    private static calcReward(gymTown: string): number {
        const gym = GymList[gymTown];
        const playerDamage = App.game.party.pokemonAttackObservable();
        let attacksToWin = 0;
        for (const pokemon of gym.getPokemonList()) {
            attacksToWin += Math.ceil( Math.min( 4, pokemon.maxHealth / Math.max(1, playerDamage) ) );
        }
        const reward = Math.ceil(attacksToWin * GameConstants.DEFEAT_POKEMONS_BASE_REWARD * GameConstants.ACTIVE_QUEST_MULTIPLIER);

        return super.randomizeReward(reward);
    }

    get description(): string {
        if (this.customDescription) {
            return this.customDescription;
        }
        const elite = this.gymTown.includes('Elite') || this.gymTown.includes('Champion');
        const displayName = GymList[this.gymTown]?.displayName;
        const leaderName = GymList[this.gymTown].leaderName.replace(/\d/g, '');
        const desc = [];

        desc.push('Defeat');
        if (displayName?.includes('Trial')) {
            desc.push(`${displayName} at ${this.gymTown}`);
        } else if (displayName || elite) {
            desc.push(displayName ?? this.gymTown);
        } else {
            desc.push(`${leaderName}'s Gym at ${this.gymTown}`);
        }
        desc.push(`in ${GameConstants.camelCaseToString(GameConstants.Region[this.region])}`);
        desc.push(`${this.amount().toLocaleString('en-US')} times.`);
        return desc.join(' ');
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        json.data.push(this.gymTown);
        return json;
    }
}
