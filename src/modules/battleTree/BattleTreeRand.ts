import SeededRand from '../utilities/SeededRand';

export class BattleTreeRand extends SeededRand {
    public static seed(state: number) {
        super.state = state;
    }
}
