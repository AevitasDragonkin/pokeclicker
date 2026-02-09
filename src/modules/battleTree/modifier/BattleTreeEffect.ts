import { TeamType } from '../BattleTreeSequence';
import { BattleTreeModifierContext } from './BattleTreeModifierContext';

export type Operation = 'additive' | 'multiplicative' | 'reset' | 'override' | 'final';

export type BattleTreeEffectValue<Data = unknown> = number | ((ctx: BattleTreeModifierContext, data: Data) => number);

export interface BattleTreeEffectTarget {
    key: string;
    scope?: TeamType[];
    bucket?: string[];
    tags?: string[];
}

export interface BattleTreeEffect<Data = unknown> {
    target?: BattleTreeEffectTarget;
    operation: Operation;
    value: BattleTreeEffectValue<Data>;
    tags?: string[];
}


