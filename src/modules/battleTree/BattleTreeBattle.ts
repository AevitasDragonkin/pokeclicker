import { BattleTreePokemon } from './BattleTreePokemon';

export enum BattleTreeBattleWinner {
    UNDEFINED,
    PLAYER_A,
    PLAYER_B,
    DRAW,
}

type BattleTreeBattleProperties = {
    pokemonA: BattleTreePokemon;
    pokemonB: BattleTreePokemon;
};

export class BattleTreeBattle {
    private readonly _pokemonA: BattleTreePokemon;
    private readonly _pokemonB: BattleTreePokemon;

    constructor(properties: BattleTreeBattleProperties) {
        this._pokemonA = properties.pokemonA;
        this._pokemonB = properties.pokemonB;
    }

    public update(delta: number): void {
        // TODO : BT : Implement the battle game loop

        this.pokemonA.update(delta);
        this.pokemonB.update(delta);
    }

    get pokemonA(): BattleTreePokemon {
        return this._pokemonA;
    }

    get pokemonB(): BattleTreePokemon {
        return this._pokemonB;
    }

    get isFinished(): boolean {
        return this.pokemonA.hitPoints === 0 || this.pokemonB.hitPoints === 0;
    }

    get winner(): BattleTreeBattleWinner {
        switch (true) {
            case this.pokemonA.hitPoints === 0 && this.pokemonB.hitPoints === 0: return BattleTreeBattleWinner.DRAW;
            case this.pokemonA.hitPoints === 0: return BattleTreeBattleWinner.PLAYER_B;
            case this.pokemonB.hitPoints === 0: return BattleTreeBattleWinner.PLAYER_A;
            default: return BattleTreeBattleWinner.UNDEFINED;
        }
    }
}
