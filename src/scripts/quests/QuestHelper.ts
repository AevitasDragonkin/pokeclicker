/// <reference path="./tieredQuestTypes/DefeatPokemonsTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/CapturePokemonsTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/CapturePokemonTypesTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/ClearBattleFrontierTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/GainFarmPointsTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/GainMoneyTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/GainTokensTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/GainGemsTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/HatchEggsTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/MineLayersTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/MineItemsTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/CatchShiniesTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/CatchShadowsTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/DefeatGymTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/DefeatDungeonTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/UsePokeballTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/UseOakItemTieredQuest.ts" />
/// <reference path="./tieredQuestTypes/HarvestBerriesTieredQuest.ts" />

class QuestHelper {

    public static quests = {
        DefeatPokemonsTieredQuest,
        CapturePokemonsTieredQuest,
        CapturePokemonTypesTieredQuest,
        ClearBattleFrontierTieredQuest,
        GainFarmPointsTieredQuest,
        GainMoneyTieredQuest,
        GainTokensTieredQuest,
        GainGemsTieredQuest,
        HatchEggsTieredQuest,
        MineLayersTieredQuest,
        MineItemsTieredQuest,
        CatchShiniesTieredQuest,
        CatchShadowsTieredQuest,
        DefeatGymTieredQuest,
        DefeatDungeonTieredQuest,
        UsePokeballTieredQuest,
        UseOakItemTieredQuest,
        HarvestBerriesTieredQuest,
    }

    public static createQuest(questType: string, data?: any[]): Quest {
        if (!this.quests[questType]) {
            console.error(`Error: Invalid quest type - ${questType}.`);
            return;
        }
        // Creating randomly generated quest
        if (!data) {
            const QuestClass = this.quests[questType];
            return new QuestClass(...QuestClass.generateData());
        }
        return new this.quests[questType](...data);
    }

    public static generateQuestList(seed: number, amount = 10, uniqueQuestTypes = true) {
        const quests = [];

        SeededRand.seed(+seed);

        // Only use unlocked quest types
        const QuestTypes = new Set(Object.entries(this.quests).filter(([key, quest]) => quest.canComplete()).map(([key]) => key));
        while (quests.length < amount && QuestTypes.size) {
            const questType = SeededRand.fromArray(Array.from(QuestTypes));
            if (uniqueQuestTypes) {
                QuestTypes.delete(questType);
            }
            const quest = this.createQuest(questType);
            quest.index = quests.length;
            quests.push(quest);
        }
        return quests;
    }

    public static highestOneShotRoute(region: GameConstants.Region): number {
        const routes = Routes.getRoutesByRegion(region).map(r => r.number);
        const first = Math.min(...routes);
        const last = Math.max(...routes);
        const attack = Math.max(1, App.game.party.calculatePokemonAttack(PokemonType.None, PokemonType.None, false, region, true, false, WeatherType.Clear));

        for (let route = last; route >= first; route--) {
            if (PokemonFactory.routeHealth(route, region) < attack) {
                return route;
            }
        }

        return 0;
    }

    public static defaultQuestTier(): QuestTier {
        return 'Easy';
    }

    public static availableQuestTiers(): QuestTier[] {
        return [
            'Easy',
            ...true ? ['Medium' as QuestTier] : [],
            ...true ? ['Hard' as QuestTier] : [],
            ...true ? ['Insane' as QuestTier] : [],
        ];
    }
}
