/// <reference path="../TieredQuest.ts" />

class GainGemsTieredQuest extends TieredQuest implements QuestInterface {
    public static maxWeight = 4;
    public static minWeight = 1.2;
    public static weights: Array<Record<string, number>> = [];

    private type: PokemonType;

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier(), type: PokemonType) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.type = type;
        this.focus = App.game.statistics.gemsGained[this.type];
    }

    public static canComplete() {
        return App.game.gems.canAccess();
    }

    public static typeWeights(): Array<Record<string, number>> {
        const types = new Array(GameHelper.enumLength(PokemonType) - 1).fill(0);
        Routes.regionRoutes.filter(r => r.isUnlocked()).forEach(r => {
            Object.values(r.pokemon).flat().forEach(p => {
                const pokemon = pokemonMap[p];
                if (!pokemon || pokemon.id <= 0) {
                    return;
                }
                pokemon.type.forEach(t => types[t]++);
            });
        });
        const max = Math.max(...types);
        // Calculate the weight
        return types.map(v => ((-v + max) / max) * (this.maxWeight - this.minWeight))
            // map the type and rounded values
            .map((weight, type) => ({type, weight: Math.round((weight + this.minWeight) * 100) / 100}));
    }

    public static generateData(): any[] {
        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(200, 600),
            Medium: SeededRand.intBetween(5000, 1500),
            Hard: SeededRand.intBetween(10000, 30000),
            Insane: SeededRand.intBetween(20000, 60000),
        };

        this.weights = this.typeWeights();
        const type = SeededRand.fromArray(this.weights.filter(w => w.weight < this.maxWeight).map(w => w.type));
        const pointsRewardPerSingleAmount = this.randomizeReward(GameConstants.DEFEAT_POKEMONS_BASE_REWARD * this.weights[type].weight * 0.5);
        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier(), type];
    }

    get description(): string {
        return this.customDescription ?? `Gain ${this.amount().toLocaleString('en-US')} ${PokemonType[this.type]} gems.`;
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        json.data.push(this.type);
        return json;
    }
}
