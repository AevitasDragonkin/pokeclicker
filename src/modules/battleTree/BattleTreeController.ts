import { BattleTreeRand } from './BattleTreeRand';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { PokemonListData, pokemonMap } from '../pokemons/PokemonList';
import { PureComputed } from 'knockout';
import { BattleTreeModifier, BattleTreeModifierEffectType } from './BattleTreeModifier';
import { BattleTreeModifiers, MODIFIER_LIST } from './BattleTreeModifiers';
import GameHelper from '../GameHelper';
import { camelCaseToString, LEGENDARIES, MYTHICALS, Region } from '../GameConstants';
import PokemonType from '../enums/PokemonType';
import { BattleTreePokemonSubset, TypedBattleTreePokemonSubset } from './BattleTreePokemonSubset/BattleTreePokemonSubset';

const filters: { name: string, filter: (list: PokemonListData[]) => PokemonListData[] }[] = [
    ...GameHelper.enumNumbers(PokemonType).map(type => {
        return { name: camelCaseToString(PokemonType[type]), filter: list => list.filter(p => p.type.includes(type)) };
    }),
    ...GameHelper.enumNumbers(PokemonType).map(type => {
        return { name: `Pure ${camelCaseToString(PokemonType[type])}`, filter: list => list.filter(p => p.type.every(t => t === type)) };
    }),
    { name: 'All', filter: list => list },
    { name: 'Legendaries and Mythicals', filter: list => list.filter(p => [...Object.values(LEGENDARIES).flatMap(m => m), ...Object.values(MYTHICALS).flatMap(m => m)].includes(p.name)) },
];

const newFilters: BattleTreePokemonSubset[] = [
    new TypedBattleTreePokemonSubset('Pure Fire', PokemonType.Fire, true),
    new TypedBattleTreePokemonSubset('Pure Grass', PokemonType.Grass, true),
    new TypedBattleTreePokemonSubset('Pure Water', PokemonType.Water, true),
    new TypedBattleTreePokemonSubset('Normal', PokemonType.Normal, false),
];

export class BattleTreeController {
    public static availablePokemonNames: PureComputed<PokemonListData[]> = ko.pureComputed(() => pokemonMap.filter(p => PokemonLocations.isObtainable(p.name)));

    public static calculateSeed(): number {
        const now = new Date();
        // return Number((now.getFullYear() - 1900) * now.getDate() + 1000 * now.getMonth() + 100000 * now.getDate());
        return Number((now.getFullYear() - 1900) * now.getDate() + 1000 * now.getMonth() + 100000 * now.getDate() * now.getHours() * (Math.floor(now.getMinutes() / 15) + 1));
    }

    public static getRegion(seed: number): Region {
        BattleTreeRand.seed(seed);
        const shuffledRegions = BattleTreeRand.shuffleArray(GameHelper.enumNumbers(Region));
        const allowedShuffledRegions = shuffledRegions.filter(value => value >= 0 && value <= player.highestRegion());

        return allowedShuffledRegions[0] ?? Region.alola;
    }

    public static getRandomFilter(seed: number, modifier: number = 0) {
        BattleTreeRand.seed(seed + modifier);
        return BattleTreeRand.fromArray(filters);
    }

    public static getRandomTeamForStage(seed: number, stage: number, amount: number): PokemonNameType[] {
        BattleTreeRand.seed(seed + 1000);
        const filteredRegionPokemon = BattleTreeRand.fromArray(newFilters).subset;

        const uniqueIDs = [...new Set(filteredRegionPokemon.map(p => Math.floor(p.id)))];

        BattleTreeRand.seed(seed + stage);
        const shuffledUniqueIDs = BattleTreeRand.shuffleArray(uniqueIDs);

        return shuffledUniqueIDs.slice(0, amount).map(id => BattleTreeRand.fromArray(filteredRegionPokemon.filter(p => Math.floor(p.id) === id)).name);
    }

    public static getLongListTeamSelection(seed: number, amount: number): PokemonNameType[] {
        BattleTreeRand.seed(seed);
        const filteredRegionPokemon = BattleTreeRand.fromArray(newFilters).subset;

        const uniqueIDs = [...new Set(filteredRegionPokemon.map(p => Math.floor(p.id)))];

        BattleTreeRand.seed(seed);
        const shuffledUniqueIDs = BattleTreeRand.shuffleArray(uniqueIDs);

        return shuffledUniqueIDs.slice(0, amount).map(id => BattleTreeRand.fromArray(filteredRegionPokemon.filter(p => Math.floor(p.id) === id)).name);
    }

    public static getModifierOptionsForStage(seed: number, runID: string, stage: number, amount: number): BattleTreeModifier[] {
        const activeModifiers = BattleTreeModifiers.getModifierList(runID)();
        const lastModifierID: number = activeModifiers[activeModifiers.length - 1]?.id ?? 0;

        BattleTreeRand.seed(seed + stage + (1000 * lastModifierID));

        return BattleTreeRand
            .shuffleWeightedArray([...MODIFIER_LIST], [...MODIFIER_LIST].map(modifier => modifier.weight))
            .filter(modifier => modifier.isUnlocked)
            .filter(modifier => modifier.limit > activeModifiers.filter(m => m.id === modifier.id).length)
            .slice(0, amount);
    }

    public static calculatePokemonLevelForStage(stage: number): number {
        // TODO : BT : Calculate proper level for provided stage
        return stage;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static calculatePokemonLevelForPlayer(pokemon: PokemonNameType): number {
        // TODO : BT : Calculate proper level for the player's pokemon
        return App.game.battleTree.battleTreeLevel;
    }

    public static calculateLongListSelectionSize(): number {
        // TODO : BT : Calculate proper size for the player's selection
        return 20;
    }

    public static calculateAttackSpeed(runID: string) {
        const initialAttackSpeed = 1;

        return BattleTreeModifiers.getModifierList(runID)()
            .flatMap(value => value.effects)
            .filter(value => value.source === 'attack-delay')
            .reduce((previousValue, currentValue) => {
                switch (currentValue.type) {
                    case BattleTreeModifierEffectType.Additive: return previousValue + currentValue.value;
                    case BattleTreeModifierEffectType.Multiplicative: return previousValue * currentValue.value;
                    case BattleTreeModifierEffectType.Reset: return initialAttackSpeed;
                    case BattleTreeModifierEffectType.Set: return currentValue.value;
                }
            }, initialAttackSpeed);
    }

    public static calculateRewardMultiplier(runID: string) {
        return BattleTreeModifiers.getModifierList(runID)()
            .flatMap(value => value.effects)
            .filter(value => value.source === 'reward')
            .reduce((previousValue, currentValue) => {
                switch (currentValue.type) {
                    case BattleTreeModifierEffectType.Multiplicative: return previousValue * currentValue.value;
                }
            }, 1);
    }

    public static calculateBattleTreeExp(name: PokemonNameType, level: number): number {
        // TODO : BT : Correct EXP scaling
        const b = pokemonMap[name]?.exp ?? 0;
        const l = level;
        const lp = App.game.battleTree.battleTreeLevel;
        const e = false ? 1.5 : 1;
        const s = 1;
        const t = 1;
        const v = 1;
        const f = 1;
        const p = 1;

        const expGen7 = Math.min(((b * l / 5) * (1 / s) * Math.pow(((2 * l + 10) / (l + lp + 10)), 2.5) + 1) * t * e * v * f * p, b * 10);

        return Math.floor(expGen7);
    }
}
