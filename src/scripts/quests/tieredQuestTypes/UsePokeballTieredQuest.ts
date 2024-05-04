/// <reference path="../TieredQuest.ts" />

class UsePokeballTieredQuest extends TieredQuest implements QuestInterface {
    private pokeball: GameConstants.Pokeball;

    constructor(amounts: {[key in QuestTier]: number}, pointsRewardPerSingleAmount: number, tier: QuestTier = QuestHelper.defaultQuestTier(), pokeball: GameConstants.Pokeball) {
        super(amounts, pointsRewardPerSingleAmount, tier);
        this.pokeball = pokeball;
        this.focus = App.game.statistics.pokeballsUsed[this.pokeball];
    }

    public static generateData(): any[] {
        const options = [
            { pokeball: GameConstants.Pokeball.Pokeball, points: GameConstants.DEFEAT_POKEMONS_BASE_REWARD },
            ...TownList['Lavender Town'].isUnlocked() ? [{ pokeball: GameConstants.Pokeball.Greatball, points: GameConstants.DEFEAT_POKEMONS_BASE_REWARD * 4}] : [],
            ...TownList['Fuchsia City'].isUnlocked() ? [{ pokeball: GameConstants.Pokeball.Ultraball, points: GameConstants.DEFEAT_POKEMONS_BASE_REWARD * 9}] : [],
        ];

        const { pokeball, points } =  SeededRand.fromArray(options);

        const amount: {[key in QuestTier]: number} = {
            Easy: SeededRand.intBetween(100, 500),
            Medium: SeededRand.intBetween(250, 12500),
            Hard: SeededRand.intBetween(5000, 25000),
            Insane: SeededRand.intBetween(10000, 50000),
        };

        const pointsRewardPerSingleAmount = super.randomizeReward(points);


        return [amount, pointsRewardPerSingleAmount, QuestHelper.defaultQuestTier(), pokeball];
    }

    get description(): string {
        return this.customDescription ?? `Use ${this.amount().toLocaleString('en-US')} ${ItemList[GameConstants.Pokeball[this.pokeball]].displayName}s.`;
    }

    toJSON(): Record<string, any> {
        const json = super.toJSON();
        json.name = this.constructor.name;
        json.data.push(this.pokeball);
        return json;
    }
}
