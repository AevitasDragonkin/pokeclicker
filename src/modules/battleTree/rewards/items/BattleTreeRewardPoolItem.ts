import Item from '../../../items/Item';
import { BattleTreeRewardPoolNameType } from '../pools/BattleTreeRewardPool';

export class BattleTreeRewardPoolItem extends Item {
    private _pool: BattleTreeRewardPoolNameType;

    constructor(pool: BattleTreeRewardPoolNameType, displayName: string, description: string) {
        super(pool, 0, undefined, undefined, displayName, description);

        this._pool = pool;
    }

    gain(n: number) {
        App.game.battleTree.sequence.rollPool(this._pool, undefined, n);
    }

    get image() {
        return `assets/images/battleTree/rewards/${this.name}.png`;
    }
}
