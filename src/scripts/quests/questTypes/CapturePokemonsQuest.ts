/// <reference path="../Quest.ts" />

class CapturePokemonsQuest extends Quest implements QuestInterface {

    constructor(capturesNeeded: number, reward: number) {
        super(capturesNeeded, reward);
        this.focus = App.game.statistics.totalPokemonCaptured;
    }

    public static generateData(): any[] {
        const amount = SeededRand.floatBetween(99, 500);
        const reward = this.calcReward(amount) / amount;
        return [amount, reward];
    }

    private static calcReward(amount: number): number {
        const reward = amount * GameConstants.CAPTURE_POKEMONS_BASE_REWARD;
        return super.randomizeReward(reward);
    }

    get description(): string {
        return this.customDescription ?? `Capture or hatch ${this.tieredAmount().toLocaleString('en-US')} Pokémon.`;
    }

    toJSON() {
        const json = super.toJSON();
        json.name = this.constructor.name;
        return json;
    }
}
