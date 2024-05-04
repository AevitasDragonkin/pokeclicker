/// <reference path="../TieredQuest.ts" />

class DefeatDungeonTieredQuest extends TieredQuest implements QuestInterface {
    private region: GameConstants.Region;

    constructor(
        amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier(),
        public dungeon: string
    ) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.region = GameConstants.getDungeonRegion(this.dungeon);
        if (this.region == GameConstants.Region.none) {
            throw new Error(`Invalid dungeon for quest: ${this.dungeon}`);
        }
        this.focus = App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(this.dungeon)];
    }

    public static generateData(): any[] {
        // Allow up to highest region
        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(5, 20),
            Medium: SeededRand.intBetween(20, 100),
            Hard: SeededRand.intBetween(100, 500),
            Insane: SeededRand.intBetween(500, 2000),
        };

        const region = SeededRand.intBetween(0, player.highestRegion());
        // Only use unlocked dungeons
        const possibleDungeons = GameConstants.RegionDungeons[region].filter(dungeon => TownList[dungeon].isUnlocked());
        // If no dungeons unlocked in this region, just use the first dungeon of the region
        const dungeon = possibleDungeons.length ? SeededRand.fromArray(possibleDungeons) : GameConstants.RegionDungeons[region][0];
        const pointsRewardPerSingleAmount = this.calcReward(dungeon);

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier(), dungeon];
    }

    private static calcReward(dungeon: string): number {
        const playerDamage = App.game.party.calculateClickAttack() + (App.game.party.pokemonAttackObservable() / GameConstants.QUEST_CLICKS_PER_SECOND);
        const attacksToDefeatPokemon = Math.ceil(Math.min(4, dungeonList[dungeon].baseHealth / playerDamage));
        const averageTilesToBoss = 13;
        const attacksToCompleteDungeon = attacksToDefeatPokemon * averageTilesToBoss;
        const completeDungeonsReward = attacksToCompleteDungeon * GameConstants.DEFEAT_POKEMONS_BASE_REWARD * GameConstants.ACTIVE_QUEST_MULTIPLIER;

        let region: GameConstants.Region, route: number;
        for (region = player.highestRegion(); region >= 0; region--) {
            route = QuestHelper.highestOneShotRoute(region); // returns 0 if no routes in this region can be one shot
            if (route) {
                break;
            }
        }
        if (!route) {
            route = 1, region = GameConstants.Region.kanto;
        }
        const tokens = PokemonFactory.routeDungeonTokens(route,region);
        const routeKillsPerDungeon = dungeonList[dungeon].tokenCost / tokens;
        const collectTokensReward = routeKillsPerDungeon * GameConstants.DEFEAT_POKEMONS_BASE_REWARD;

        const reward = Math.ceil(completeDungeonsReward + collectTokensReward);
        return super.randomizeReward(reward);
    }

    get description(): string {
        return this.customDescription ?? `Defeat the ${this.dungeon} dungeon in ${GameConstants.camelCaseToString(GameConstants.Region[this.region])} ${this.amount().toLocaleString('en-US')} times.`;
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        json.data.push(this.dungeon);
        return json;
    }
}
