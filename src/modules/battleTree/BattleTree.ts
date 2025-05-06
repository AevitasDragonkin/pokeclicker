import {Feature} from '../DataStore/common/Feature';
import {GameState} from '../GameConstants';

export class BattleTree implements Feature {
    name: string = 'BattleTree';
    saveKey: string = 'battleTree';
    defaults: Record<string, any> = { };

    canAccess(): boolean {
        return true;
    }

    initialize(): void {

    }

    update(delta: number): void {
    }

    public enter(): void {
        App.game.gameState = GameState.battleTree;
    }

    public leave(): void {
        App.game.gameState = GameState.town;
    }

    toJSON(): Record<string, any> {
        return { };
    }

    fromJSON(json: Record<string, any>): void {
        if (json) {

        }
    }
}
