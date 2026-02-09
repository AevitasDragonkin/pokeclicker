import { BattleTreeSequence } from '../BattleTreeSequence';

export interface BattleTreeModifierContext {
    sequence: BattleTreeSequence;

    setAutoPickModifiers: (enabled: boolean) => void;

    endSequence: (reason: string) => void;
}
