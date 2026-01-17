import { ObservableArray } from 'knockout';
import { BattleTreePokemon } from './BattleTreePokemon';
import { PokemonNameType } from '../pokemons/PokemonNameType';

interface BattleTreeTeamProperties {
    minTeamSize?: number;
    maxTeamSize?: number;
}

interface BattleTreeTeamSaveData {

}

export class BattleTreeTeam {
    private _minTeamSize: number;
    private _maxTeamSize: number;
    private _list: ObservableArray<BattleTreePokemon>;

    constructor(properties: BattleTreeTeamProperties) {
        this._minTeamSize = properties.minTeamSize ?? 1;
        this._maxTeamSize = properties.maxTeamSize ?? 3;
        this._list = ko.observableArray();
    }

    public addPokemon(name: PokemonNameType, level: number): boolean {
        if (this.isFull) return false;
        if (this.list.findIndex(p => p.name === name) >= 0) return false;

        this._list.push(new BattleTreePokemon({
            name,
            level,
        }));

        return true;
    }

    public removePokemon(name: PokemonNameType): void {
        this._list.remove(this.list.find(p => p.name === name));
    }

    public removeAllPokemon(): void {
        this._list.removeAll();
    }

    get list(): BattleTreePokemon[] {
        return this._list();
    }

    get minTeamSize(): number {
        return this._minTeamSize;
    }

    get maxTeamSize(): number {
        return this._maxTeamSize;
    }

    get canStart(): boolean {
        return this._list().length >= this._minTeamSize;
    }

    get isFull(): boolean {
        return this._list().length === this._maxTeamSize;
    }

    public toJSON(): BattleTreeTeamSaveData {
        return {

        };
    }

    static fromJSON(json: BattleTreeTeamSaveData): BattleTreeTeam {
        const team: BattleTreeTeam = new BattleTreeTeam({  });

        return team;
    }
}
