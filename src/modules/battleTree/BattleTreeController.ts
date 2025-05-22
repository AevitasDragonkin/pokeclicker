import { BattleTreeRand } from './BattleTreeRand';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { PokemonListData, pokemonMap } from '../pokemons/PokemonList';
import { PureComputed } from 'knockout';
import { BattleTreeModifier, BattleTreeModifierEffectType } from './BattleTreeModifier';
import { BattleTreeModifiers, MODIFIER_LIST } from './BattleTreeModifiers';
import GameHelper from '../GameHelper';
import { Region } from '../GameConstants';

export class BattleTreeController {
    public static availablePokemonNames: PureComputed<PokemonListData[]> = ko.pureComputed(() => pokemonMap.filter(p => PokemonLocations.isObtainable(p.name)));

    public static calculateSeed(): number {
        const now = new Date();
        return Number((now.getFullYear() - 1900) * now.getDate() + 1000 * now.getMonth() + 100000 * now.getDate());
    }

    public static getRegion(seed: number): Region {
        BattleTreeRand.seed(seed);
        const shuffledRegions = BattleTreeRand.shuffleArray(GameHelper.enumNumbers(Region));
        const allowedShuffledRegions = shuffledRegions.filter(value => value >= 0 && value <= player.highestRegion());

        return allowedShuffledRegions[0] ?? Region.alola;
    }

    public static getRandomTeamForStage(seed: number, stage: number, amount: number): PokemonNameType[] {
        const regionPokemon = this.availablePokemonNames().filter(p => pokemonMap[p.name].nativeRegion <= player.highestRegion());
        const regionPokemonUniqueIDs = [...new Set(regionPokemon.map(p => Math.floor(p.id)))];

        BattleTreeRand.seed(seed + stage);
        const shuffledUniqueIDs = BattleTreeRand.shuffleArray(regionPokemonUniqueIDs);

        return shuffledUniqueIDs.slice(0, amount).map(id => BattleTreeRand.fromArray(pokemonMap.filter(p => Math.floor(p.id) === id && p.nativeRegion <= player.highestRegion())).name);
    }

    public static getLongListTeamSelection(seed: number, amount: number): PokemonNameType[] {
        const selectedRegion = this.getRegion(seed);

        const regionPokemon = this.availablePokemonNames().filter(p => pokemonMap[p.name].nativeRegion === selectedRegion);
        const regionPokemonUniqueIDs = [...new Set(regionPokemon.map(p => Math.floor(p.id)))];

        BattleTreeRand.seed(seed);
        const shuffledUniqueIDs = BattleTreeRand.shuffleArray(regionPokemonUniqueIDs);

        return shuffledUniqueIDs.slice(0, amount).map(id => BattleTreeRand.fromArray(pokemonMap.filter(p => Math.floor(p.id) === id && p.nativeRegion === selectedRegion)).name);
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
