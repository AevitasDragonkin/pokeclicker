import { ObservableArray } from 'knockout';
import { BattleTreePokemon, BattleTreePokemonSaveData } from './BattleTreePokemon';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { TeamType } from './BattleTreeSequence';

interface BattleTreeTeamProperties {
    team: TeamType;
    minTeamSize?: number;
    maxTeamSize?: number;
}

export interface BattleTreeTeamSaveData {
    minTeamSize: number;
    maxTeamSize: number;
    list: BattleTreePokemonSaveData[];
}

export class BattleTreeTeam {
    private _team: TeamType;
    private _minTeamSize: number;
    private _maxTeamSize: number;
    private _list: ObservableArray<BattleTreePokemon>;

    constructor(properties: BattleTreeTeamProperties) {
        this._team = properties.team;
        this._minTeamSize = properties.minTeamSize ?? 1;
        this._maxTeamSize = properties.maxTeamSize ?? 3;
        this._list = ko.observableArray();
    }

    public hasPokemon(name: PokemonNameType): boolean {
        return this.list.findIndex(p => p.name === name) >= 0;
    }

    public getPokemonAvailableToFight(name?: PokemonNameType): BattleTreePokemon {
        return this.list.find(value => value.hitpoints > 0 && value.name === name) ??
            this.list.find(value => value.hitpoints > 0) ??
            this.list[0];
    }

    public addPokemon(name: PokemonNameType, level: number): boolean {
        if (this.isFull) return false;
        if (this.hasPokemon(name)) return false;

        this._list.push(new BattleTreePokemon({
            name,
            level,
            team: this._team,
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

    get canContinueToFight(): boolean {
        return this.list.some(value => value.hitpoints > 0);
    }

    get isFull(): boolean {
        return this._list().length === this._maxTeamSize;
    }

    public toJSON(): BattleTreeTeamSaveData {
        return {
            minTeamSize: this.minTeamSize,
            maxTeamSize: this.maxTeamSize,
            list: this.list.map(value => value.toJSON()),
        };
    }

    static fromJSON(json: BattleTreeTeamSaveData, team: TeamType): BattleTreeTeam {
        const btTeam: BattleTreeTeam = new BattleTreeTeam({
            team,
            minTeamSize: json.minTeamSize,
            maxTeamSize: json.maxTeamSize,
        });

        btTeam._list.push(...json.list.map(value => BattleTreePokemon.fromJSON(value, team)));

        return btTeam;
    }
}
