import { BattleTreePokemon } from './BattleTreePokemon';
import { BattleTreeController } from './BattleTreeController';

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
    attackCounter?: number;
    attacker?: number;
};

export class BattleTreeBattle {
    public readonly runID: string;
    private readonly _pokemonA: BattleTreePokemon;
    private readonly _pokemonB: BattleTreePokemon;

    private _attackCounter: number = 0;
    private _attacker: number = -1;

    constructor(properties: BattleTreeBattleProperties) {
        this.runID = properties.runID;
        this._pokemonA = properties.pokemonA;
        this._pokemonB = properties.pokemonB;

        this._attacker = properties.attacker ?? this._pokemonA.speed >= this.pokemonB.speed ? 0 : 1;
        this._attackCounter = properties.attackCounter ?? 0;
    }

    public update(delta: number): void {
        if (this._pokemonA.HP <= 0 || this.pokemonB.HP <= 0) {
            return;
        }

        this._attackCounter += delta;

        const attackSpeed = BattleTreeController.calculateAttackSpeed(this.runID);
        while (this._attackCounter >= attackSpeed) {
            if (this._attacker % 2 === 0) {
                this.pokemonA.attackTarget(this.pokemonB);
            } else {
                this.pokemonB.attackTarget(this.pokemonA);
            }
            ++this._attacker;

            this._attackCounter -= attackSpeed;
        }
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

    toJSON(): Record<string, any> {
        return {
            pokemonA: this.pokemonA.name,
            pokemonB: this.pokemonB.name,
            attackCounter: this._attackCounter,
            attacker: this._attacker,
        };
    }
}
