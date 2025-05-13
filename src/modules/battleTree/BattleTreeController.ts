import { BattleTreeRand } from './BattleTreeRand';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { PokemonListData, pokemonMap } from '../pokemons/PokemonList';
import { PureComputed } from 'knockout';
import { BattleTreeModifier } from './BattleTreeModifier';
import { BattleTreeModifiers, MODIFIER_LIST } from './BattleTreeModifiers';
import {BattleTree} from './BattleTree';

export class BattleTreeController {
    public static availablePokemonNames: PureComputed<PokemonListData[]> = ko.pureComputed(() => pokemonMap.filter(p => PokemonLocations.isObtainable(p.name)));
    public static uniqueIDs: PureComputed<number[]> = ko.pureComputed(() => [...new Set(BattleTreeController.availablePokemonNames().map(p => Math.floor(p.id)))]);

    public static calculateSeed(): number {
        const now = new Date();
        return Number((now.getFullYear() - 1900) * now.getDate() + 1000 * now.getMonth() + 100000 * now.getDate());
    }

    public static getRandomTeamForStage(seed: number, stage: number, amount: number): PokemonNameType[] {
        BattleTreeRand.seed(seed + stage);

        return BattleTreeRand.shuffleArray(this.uniqueIDs()).slice(0, amount)
            .map(id => BattleTreeRand.fromArray(pokemonMap.filter(p => Math.floor(p.id) === id && p.nativeRegion <= player.highestRegion())).name);
    }

    public static getLongListTeamSelection(seed: number, amount: number): PokemonNameType[] {
        BattleTreeRand.seed(seed);

        return BattleTreeRand.shuffleArray(this.uniqueIDs()).slice(0, amount)
            .map(id => BattleTreeRand.fromArray(pokemonMap.filter(p => Math.floor(p.id) === id && p.nativeRegion <= player.highestRegion())).name);
    }

    public static getModifierOptionsForStage(seed: number, runID: string, stage: number, amount: number): BattleTreeModifier[] {
        BattleTreeRand.seed(seed + stage);

        const activeModifiers = BattleTreeModifiers.getModifierList(runID)();
        const possibleModifiers = MODIFIER_LIST
            .filter(modifier => modifier.isUnlocked)
            .filter(modifier => modifier.limit > activeModifiers.filter(m => m.id === modifier.id).length);

        return BattleTreeRand
            .shuffleWeightedArray(possibleModifiers, possibleModifiers.map(modifier => modifier.weight))
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

    public static addBattleTreeExp(name: PokemonNameType, level: number): void {
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

        App.game.battleTree.addExp(Math.floor(expGen7));
    }
}
