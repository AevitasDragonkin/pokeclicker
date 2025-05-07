import { BattleTreePokemon } from './BattleTreePokemon';
import { BattleTreeRand } from './BattleTreeRand';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { PokemonListData, pokemonMap } from '../pokemons/PokemonList';
import { PureComputed } from 'knockout';

export class BattleTreeController {
    public static availablePokemonNames: PureComputed<PokemonListData[]> = ko.pureComputed(() => pokemonMap.filter(p => PokemonLocations.isObtainable(p.name)));
    public static uniqueIDs: PureComputed<number[]> = ko.pureComputed(() => [...new Set(BattleTreeController.availablePokemonNames().map(p => Math.floor(p.id)))]);

    public static calculateSeed(): number {
        const now = new Date();
        return Number((now.getFullYear() - 1900) * now.getDate() + 1000 * now.getMonth() + 100000 * now.getDate());
    }

    public static getRandomTeamForStage(seed: number, stage: number, amount: number): BattleTreePokemon[] {
        BattleTreeRand.seed(seed + stage);

        return BattleTreeRand.shuffleArray(this.uniqueIDs()).slice(0, amount)
            .map(id => BattleTreeRand.fromArray(pokemonMap.filter(p => Math.floor(p.id) === id && p.nativeRegion >= 0 && p.nativeRegion <= player.highestRegion())).name)
            .map(name => new BattleTreePokemon({ name, level: this.calculatePokemonLevelForStage(stage) }));
    }

    public static getLongListTeamSelection(seed: number, amount: number): PokemonNameType[] {
        BattleTreeRand.seed(seed);

        return BattleTreeRand.shuffleArray(this.uniqueIDs()).slice(0, amount)
            .map(id => BattleTreeRand.fromArray(pokemonMap.filter(p => Math.floor(p.id) === id && p.nativeRegion >= 0 && p.nativeRegion <= player.highestRegion())).name);
    }

    public static calculatePokemonLevelForStage(stage: number): number {
        // TODO : BT : Calculate proper level for provided stage
        return stage;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static calculatePokemonLevelForPlayer(pokemon: PokemonNameType): number {
        // TODO : BT : Calculate proper level for the player's pokemon
        return 100;
    }

    public static calculateLongListSelectionSize(): number {
        // TODO : BT : Calculate proper size for the player's selection
        return 20;
    }
}
