import { TeamType } from '../BattleTreeSequence';
import { BattleTreeModifierContext } from './BattleTreeModifierContext';

export type BattleTreeEffectKey
    = 'rewards'
    | 'game_speed'
    | 'attack_speed'
    | 'attack'
    | 'defense'
    | 'speed'
    | 'max_hitpoints'
    | 'level'
    | 'damage_taken_after_types'
    | 'damage_dealt_after_types'
    | 'modifier_count'
    | 'auto_pick_modifier'
    | 'min_team_size'
    | 'max_team_size'
    | 'stage'
    | 'type_effectiveness'
    | 'life_steal_percertage';
export type Operation = 'additive' | 'multiplicative' | 'reset' | 'override' | 'final';

export type BattleTreeEffectValue<Data = unknown> = number | ((ctx: BattleTreeModifierContext, data: Data) => number);

export interface BattleTreeEffectTarget {
    key: BattleTreeEffectKey;
    scope?: TeamType[];
}

export interface BattleTreeEffect<Data = unknown> {
    target?: BattleTreeEffectTarget;
    operation: Operation;
    value: BattleTreeEffectValue<Data>;
}


