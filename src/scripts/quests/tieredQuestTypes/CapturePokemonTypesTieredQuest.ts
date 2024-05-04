/// <reference path="../TieredQuest.ts" />

class CapturePokemonTypesTieredQuest extends TieredQuest implements QuestInterface {
    public static maxWeight = 4;
    public static minWeight = 1.2;
    public static weights: Array<Record<string, number>> = [];

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier(), public type: PokemonType) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.focus = ko.pureComputed(() => pokemonMap.filter(p => p.type.includes(this.type)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0));
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
        this.weights = this.typeWeights();
        const type = SeededRand.fromArray(this.weights.filter(w => w.weight < this.maxWeight).map(w => w.type));

        const pointsRewardPerSingleAmount = super.randomizeReward(GameConstants.CAPTURE_POKEMONS_BASE_REWARD * this.weights[type].weight * 2);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(50, 250),
            Medium: SeededRand.intBetween(50, 250),
            Hard: SeededRand.intBetween(50, 250),
            Insane: SeededRand.intBetween(50, 250),
        };

        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier(), type];
    }

    get description(): string {
        return this.customDescription ?? `Capture or hatch ${this.amount().toLocaleString('en-US')} ${PokemonType[this.type]}-type Pokémon.`;
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        json.data.push(this.type);
        return json;
    }
}
