import { Observable } from 'knockout';

export enum BattleTreeRunState {
    TEAM_SELECTION,
    BATTLE,
    REWARD,
    FINISHED,
}

export class BattleTreeRun {
    private _seed: Observable<number>;
    private _stage: Observable<number>;
    private _state: Observable<BattleTreeRunState>;

    constructor() {
        this._seed = ko.observable(0); // TODO : BT : Seed correctly
        this._stage = ko.observable(1);
        this._state = ko.observable(BattleTreeRunState.TEAM_SELECTION);
    }

    public update(delta: number): void {
        // TODO : BT : Update the run game loop
    }

    get stage(): number {
        return this._stage();
    }

    get state(): BattleTreeRunState {
        return this._state();
    }

    toJSON(): Record<string, any> {
        return {
            seed: this._seed(),
            stage: this._stage(),
            state: this._state(),
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreeRun {
        const run: BattleTreeRun = new BattleTreeRun();

        run._stage(json.stage ?? 1);
        run._seed(json.seed ?? 0);
        run._state(json.state ?? BattleTreeRunState.TEAM_SELECTION);

        return run;
    }
}
