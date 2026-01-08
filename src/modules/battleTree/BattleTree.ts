import { Feature } from '../DataStore/common/Feature';
import { GameState } from '../GameConstants';

export class BattleTree implements Feature {
    name: string = 'BattleTree';
    saveKey: string = 'battleTree';
    defaults: Record<string, any> = { };

    canAccess(): boolean {
        return true;
    }

    initialize(): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(delta: number) {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromJSON(json: Record<string, any>) {
    }
}
