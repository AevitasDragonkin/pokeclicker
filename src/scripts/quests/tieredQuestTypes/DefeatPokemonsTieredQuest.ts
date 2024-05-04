/// <reference path="../TieredQuest.ts" />

class DefeatPokemonsTieredQuest extends TieredQuest implements QuestInterface {

    constructor(
        amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier(),
        public route: number,
        public region: GameConstants.Region,
    ) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = App.game.statistics.routeKills[this.region][this.route];
    }

    public static generateData(): any[] {
        const region = SeededRand.intBetween(0, player.highestRegion());
        // Only use unlocked routes
        const possibleRoutes = Routes.getRoutesByRegion(region).map(route => route.number).filter(route => MapHelper.accessToRoute(route, region));
        // If no routes unlocked in this region, just use the first route of the region
        const route = possibleRoutes.length ? SeededRand.fromArray(possibleRoutes) : GameConstants.StartingRoutes[region];
        const pointsRewardPerSingleAmount = this.calcReward(route, region);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(100, 500),
            Medium: SeededRand.intBetween(2500, 12500),
            Hard: SeededRand.intBetween(5000, 25000),
            Insane: SeededRand.intBetween(10000, 50000),
        };

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier(), route, region];
    }

    private static calcReward(route: number, region: number): number {
        const attacksPerPokemon = Math.ceil(Math.min(4, PokemonFactory.routeHealth(route, region) / Math.max(1, App.game.party.pokemonAttackObservable())));
        const reward = GameConstants.DEFEAT_POKEMONS_BASE_REWARD * attacksPerPokemon;
        return super.randomizeReward(reward);
    }

    get description(): string {
        return this.customDescription ?? `Defeat ${this.amount().toLocaleString('en-US')} Pokémon on ${Routes.getName(this.route, this.region, true)}.`;
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        json.data.push(this.route);
        json.data.push(this.region);
        return json;
    }
}
