import Item from '../../items/Item';

export class BattleTreeExperienceItem extends Item {
    constructor() {
        super('battleTreeExperience', 0, undefined, undefined, 'Battle Tree Experience', 'Adds experience in the Battle Tree');
    }

    gain(n: number) {
        App.game.battleTree.addExp(n);
    }

    get image() {
        return '';
    }
}
