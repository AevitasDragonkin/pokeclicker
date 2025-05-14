import { Feature } from '../DataStore/common/Feature';
import { GameState } from '../GameConstants';
import { Observable, ObservableArray, PureComputed } from 'knockout';
import { BattleTreeRun } from './BattleTreeRun';
import Notifier from '../notifications/Notifier';
import NotificationConstants from '../notifications/NotificationConstants';
import { PokemonNameType } from '../pokemons/PokemonNameType';

export class BattleTree implements Feature {
    name: string = 'BattleTree';
    saveKey: string = 'battleTree';
    defaults: Record<string, any> = { };

    private _battleTreeExp: Observable<number> = ko.observable(0);
    private _battleTreeLevel: PureComputed<number> = ko.pureComputed(() => BattleTree.convertExperienceToLevel(this._battleTreeExp()));
    private _progressToNextLevel: PureComputed<number> = ko.pureComputed(() => {
        if (this._battleTreeLevel() >= BattleTree.MAX_LEVEL) {
            return 1;
        }

        return (this._battleTreeExp() - BattleTree.convertLevelToExperience(this._battleTreeLevel())) /
            (BattleTree.convertLevelToExperience(this._battleTreeLevel() + 1) - BattleTree.convertLevelToExperience(this._battleTreeLevel()));
    });

    private _currentRun: Observable<BattleTreeRun | null> = ko.observable(null);

    private _previousTeam: ObservableArray<PokemonNameType> = ko.observableArray();

    public static MAX_LEVEL: number = 100;

    canAccess(): boolean {
        return true;
    }

    initialize(): void {

    }

    update(delta: number): void {
        if (App.game.gameState === GameState.battleTree) {
            this.currentRun?.update(delta);
        }
    }

    public enter(): void {
        App.game.gameState = GameState.battleTree;
    }

    public leave(): void {
        App.game.gameState = GameState.town;
    }

    public createNewBattleTreeRun(): void {
        this._previousTeam(this.currentRun?.teamA.map(p => p.name) ?? []);

        this._currentRun(new BattleTreeRun());
    }

    public loadPreviousTeam(): void {
        this.currentRun.emptyPlayerATeam();
        this._previousTeam()
            .filter(p => this.currentRun.longListSelection().includes(p))
            .forEach(p => this.currentRun.addPokemonToPlayerATeam(p));
    }

    public abortRun(): void {
        this.createNewBattleTreeRun();
    }

    public addExp(amount: number): void {
        const currentLevel = this._battleTreeLevel();
        this._battleTreeExp(this._battleTreeExp() + amount);

        if (this._battleTreeLevel() > currentLevel) {
            Notifier.notify({
                message: `Your Battle Tree level has increased to ${this._battleTreeLevel()}`,
                type: NotificationConstants.NotificationOption.success,
                timeout: 1e4,
            });
        }
    }

    get battleTreeExp(): number {
        return this._battleTreeExp();
    }

    get battleTreeLevel(): number {
        return this._battleTreeLevel();
    }

    get progressToNextLevel(): number {
        return this._progressToNextLevel();
    }

    get currentRun(): BattleTreeRun | null {
        return this._currentRun();
    }

    get previousTeam(): PokemonNameType[] {
        return this._previousTeam();
    }

    toJSON(): Record<string, any> {
        return {
            battleTreeExp: this._battleTreeExp(),
            run: this.currentRun?.toJSON(),
        };
    }

    fromJSON(json: Record<string, any>): void {
        if (json.run) {
            this._battleTreeExp(json.battleTreeExp ?? 0);
            this._currentRun(BattleTreeRun.fromJSON(json.run));
        }
    }

    public static convertLevelToExperience(level: number): number {
        return level <= 1 ? 0 : Math.floor(5 * Math.pow(level, 3) / 4);
    }

    public static convertExperienceToLevel(experience: number): number {
        let level = 0;
        while (experience >= this.convertLevelToExperience(level + 1)) {
            ++level;
        }
        return Math.min(Math.max(level, 1), BattleTree.MAX_LEVEL);
    }
}
