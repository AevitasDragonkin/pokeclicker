import { Feature } from '../DataStore/common/Feature';
import { GameState } from '../GameConstants';
import { Observable } from 'knockout';
import { BattleTreeRun } from './BattleTreeRun';

export class BattleTree implements Feature {
    name: string = 'BattleTree';
    saveKey: string = 'battleTree';
    defaults: Record<string, any> = { };

    private _currentRun: Observable<BattleTreeRun | null> = ko.observable(null);

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
        this._currentRun(new BattleTreeRun());
    }

    public abortRun(): void {
        this._currentRun(null);
    }

    get currentRun(): BattleTreeRun | null {
        return this._currentRun();
    }

    toJSON(): Record<string, any> {
        return {
            run: this.currentRun?.toJSON(),
        };
    }

    fromJSON(json: Record<string, any>): void {
        if (json.run) {
            this._currentRun(BattleTreeRun.fromJSON(json.run));
        }
    }
}
