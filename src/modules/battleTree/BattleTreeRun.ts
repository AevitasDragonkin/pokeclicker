import { Observable } from 'knockout';

export class BattleTreeRun {
    private _seed: Observable<number>;
    private _stage: Observable<number>;

    constructor() {
        this._seed = ko.observable(0); // TODO : BT : Seed correctly
        this._stage = ko.observable(1);
    }

    public update(delta: number): void {
        // TODO : BT : Update the run game loop
    }

    toJSON(): Record<string, any> {
        return {
            seed: this._seed(),
            stage: this._stage(),
        };
    }

    static fromJSON(json: Record<string, any>): BattleTreeRun {
        const run: BattleTreeRun = new BattleTreeRun();

        run._stage(json.stage ?? 1);
        run._seed(json.seed ?? 0);

        return run;
    }
}
