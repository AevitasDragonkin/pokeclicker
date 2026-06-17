import { TeamType } from '../BattleTreeSequence';
import { BattleTreeModifierContext } from './BattleTreeModifierContext';
import type { BattleTreePokemon } from '../BattleTreePokemon';

export type BattleTreeEffectKey
    = 'reward_base_rate'
    | 'reward_multiplier'
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
    | 'type_inversion'
    | 'life_steal_percertage';
export type Operation = 'additive' | 'multiplicative' | 'reset' | 'override' | 'final';

export interface BattleTreeEffectRuntimeContext {
    pokemon?: BattleTreePokemon;
}

export type BattleTreeEffectValue<Data = unknown> = number | ((ctx: BattleTreeModifierContext, data: Data, runtimeContext: BattleTreeEffectRuntimeContext) => number);

export interface BattleTreeEffectTarget {
    key: BattleTreeEffectKey;
    scope?: TeamType[];
}

export interface BattleTreeEffect<Data = unknown> {
    target?: BattleTreeEffectTarget;
    operation: Operation;
    value: BattleTreeEffectValue<Data>;
}


