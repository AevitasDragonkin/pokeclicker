import { BattleTreeUtil } from './util/BattleTreeUtil';
import { BattleTreePokemon } from './BattleTreePokemon';
import { PokemonNameType } from '../pokemons/PokemonNameType';

export enum BattleTreeFightWinner {
    UNDEFINED,
    POKEMON_A,
    POKEMON_B,
    DRAW,
}

interface BattleTreeFightProperties {
    pokemonA: BattleTreePokemon;
    pokemonB: BattleTreePokemon;
    attackCounter?: number;
    attacker?: number;
}

export interface BattleTreeFightSaveData {
    pokemonA: PokemonNameType;
    pokemonB: PokemonNameType;
    attackCounter: number;
    attacker: number;
}

export class BattleTreeFight {
    private readonly _pokemonA: BattleTreePokemon;
    private readonly _pokemonB: BattleTreePokemon;

    private _attackCounter: number = 0;
    private _attacker: number = -1;

    constructor(properties: BattleTreeFightProperties) {
        this._pokemonA = properties.pokemonA;
        this._pokemonB = properties.pokemonB;

        this._attackCounter = properties.attackCounter ?? 0;
        this._attacker = properties.attacker ?? (this._pokemonA.speed >= this._pokemonB.speed ? 0 : 1);
    }

    public update(delta: number): void {
        this._attackCounter += delta;

        const attackSpeed = BattleTreeUtil.calculateAttackSpeed();

        while (this._attackCounter >= attackSpeed) {
            if (this.isFinished) {
                return;
            }

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
        return this.pokemonA.hitpoints === 0 || this.pokemonB.hitpoints === 0;
    }

    get winner(): BattleTreeFightWinner {
        switch (true) {
            case this.pokemonA.hitpoints === 0 && this.pokemonB.hitpoints === 0: return BattleTreeFightWinner.DRAW;
            case this.pokemonA.hitpoints === 0: return BattleTreeFightWinner.POKEMON_B;
            case this.pokemonB.hitpoints === 0: return BattleTreeFightWinner.POKEMON_A;
            default: return BattleTreeFightWinner.UNDEFINED;
        }
    }

    public toJSON(): BattleTreeFightSaveData {
        return {
            pokemonA: this._pokemonA.name,
            pokemonB: this._pokemonB.name,
            attackCounter: this._attackCounter,
            attacker: this._attacker,
        };
    }
}
