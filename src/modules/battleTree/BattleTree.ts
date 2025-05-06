import { Feature } from '../DataStore/common/Feature';

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

    toJSON(): Record<string, any> {
        return { };
    }

    fromJSON(json: Record<string, any>): void {
        if (json) {

        }
    }
}
