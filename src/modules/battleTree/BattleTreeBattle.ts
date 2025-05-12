import { BattleTreePokemon } from './BattleTreePokemon';

export enum BattleTreeBattleWinner {
    UNDEFINED,
    PLAYER_A,
    PLAYER_B,
    DRAW,
}

type BattleTreeBattleProperties = {
    runID: string;
    pokemonA: BattleTreePokemon;
    pokemonB: BattleTreePokemon;
};

export class BattleTreeBattle {
    public readonly runID: string;
    private readonly _pokemonA: BattleTreePokemon;
    private readonly _pokemonB: BattleTreePokemon;

    constructor(properties: BattleTreeBattleProperties) {
        this.runID = properties.runID;
        this._pokemonA = properties.pokemonA;
        this._pokemonB = properties.pokemonB;
    }

    public update(delta: number): void {
        if (this._pokemonA.HP <= 0 || this.pokemonB.HP <= 0) {
            return;
        }

        this.pokemonA.update(delta);
        this.pokemonB.update(delta);

        if (this.pokemonA.canAttack) this.pokemonA.attackTarget(this.pokemonB);
        if (this.pokemonB.canAttack) this.pokemonB.attackTarget(this.pokemonA);
    }

    get pokemonA(): BattleTreePokemon {
        return this._pokemonA;
    }

    get pokemonB(): BattleTreePokemon {
        return this._pokemonB;
    }

    get isFinished(): boolean {
        return this.pokemonA.HP === 0 || this.pokemonB.HP === 0;
    }

    get winner(): BattleTreeBattleWinner {
        switch (true) {
            case this.pokemonA.HP === 0 && this.pokemonB.HP === 0: return BattleTreeBattleWinner.DRAW;
            case this.pokemonA.HP === 0: return BattleTreeBattleWinner.PLAYER_B;
            case this.pokemonB.HP === 0: return BattleTreeBattleWinner.PLAYER_A;
            default: return BattleTreeBattleWinner.UNDEFINED;
        }
    }
}
