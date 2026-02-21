export enum BattleTreeSequenceState {
    PREPARATION = 'PREPARATION',
    POWERUP = 'POWERUP',
    BATTLE = 'BATTLE',
    REWARD = 'REWARD',
    MODIFIER = 'MODIFIER',
    FINISHED = 'FINISHED',
}

export type BattleTreeRecurrence = 'once' | 'per_seed' | 'per_sequence';
