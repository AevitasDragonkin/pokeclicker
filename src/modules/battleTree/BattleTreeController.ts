import { BattleTreePokemon } from './BattleTreePokemon';
import { BattleTreeRand } from './BattleTreeRand';
import { PokemonNameType } from '../pokemons/PokemonNameType';

export class BattleTreeController {
    public static getRandomTeamForStage(seed: number, stage: number, amount: number): BattleTreePokemon[] {
        // TODO : BT : Return actual randomized list from all pokemon
        const list: BattleTreePokemon[] = [
            new BattleTreePokemon({ name: 'Bulbasaur', level: this.calculatePokemonLevelForStage(stage) }),
            new BattleTreePokemon({ name: 'Squirtle', level: this.calculatePokemonLevelForStage(stage) }),
            new BattleTreePokemon({ name: 'Charmander', level: this.calculatePokemonLevelForStage(stage) }),
            new BattleTreePokemon({ name: 'Mew', level: this.calculatePokemonLevelForStage(stage) }),
            new BattleTreePokemon({ name: 'Mewtwo', level: this.calculatePokemonLevelForStage(stage) }),
            new BattleTreePokemon({ name: 'Rhydon', level: this.calculatePokemonLevelForStage(stage) }),
        ];

        BattleTreeRand.seed(seed + stage);
        return BattleTreeRand.shuffleArray(list).slice(0, amount);
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
