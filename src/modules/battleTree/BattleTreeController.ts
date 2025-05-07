import { BattleTreePokemon } from './BattleTreePokemon';
import { BattleTreeRand } from './BattleTreeRand';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { pokemonMap } from '../pokemons/PokemonList';

export class BattleTreeController {
    public static getRandomTeamForStage(seed: number, stage: number, amount: number): BattleTreePokemon[] {
        BattleTreeRand.seed(seed + stage);
        return BattleTreeRand
            .shuffleArray(pokemonMap.filter(p => p.nativeRegion >= 0 && p.nativeRegion <= player.highestRegion()).map(p => p.name))
            .slice(0, amount)
            .map(name => new BattleTreePokemon({ name, level: this.calculatePokemonLevelForStage(stage) }));
    }

    public static getLongListTeamSelection(seed: number, amount: number): PokemonNameType[] {
        BattleTreeRand.seed(seed);
        return BattleTreeRand
            .shuffleArray(pokemonMap.filter(p => p.nativeRegion >= 0 && p.nativeRegion <= player.highestRegion()).map(p => p.name))
            .slice(0, amount);
    }

    public static calculatePokemonLevelForStage(stage: number): number {
        // TODO : BT : Calculate proper level for provided stage
        return stage;
    }

    public static calculatePokemonLevelForPlayer(pokemon: PokemonNameType): number {
        // TODO : BT : Calculate proper level for the player's pokemon
        return 100;
    }
}
