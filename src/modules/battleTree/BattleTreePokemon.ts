import { PokemonNameType } from '../pokemons/PokemonNameType';
import { Observable } from 'knockout';

type BattleTreePokemonProperties = {
    name: PokemonNameType;
    level: number;
};

export class BattleTreePokemon {
    private readonly _name: PokemonNameType;
    private readonly _level: number;

    private _hitPoints: Observable<number> = ko.observable(0).extend({ numeric: 0 });
    private _attackCounter: number;

    constructor(properties: BattleTreePokemonProperties) {
        this._name = properties.name;
        this._level = properties.level;

        this._hitPoints(this.maxHitPoints);
        this._attackCounter = 0;
    }

    public update(delta: number): void {
        this._attackCounter += delta;
    }

    public resetAttackCounter(): void {
        this._attackCounter = 0;
    }

    get name(): PokemonNameType {
        return this._name;
    }

    get level(): number {
        return this._level;
    }

    get hitPoints(): number {
        return this._hitPoints();
    }

    get maxHitPoints(): number {
        // TODO : BT : Implement calculating max hitpoints
        return 5000;
    }

    toJSON(): Record<string, any> {
        return {
            name: this._name,
            level: this._level,
            hp: this._hitPoints(),
            attackCounter: this._attackCounter,
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreePokemon {
        const pokemon: BattleTreePokemon = new BattleTreePokemon({
            name: json.name,
            level: json.level,
        });

        pokemon._hitPoints(json.hp ?? pokemon.maxHitPoints);
        pokemon._attackCounter = json.attackCounter ?? 0;

        return pokemon;
    }
}
