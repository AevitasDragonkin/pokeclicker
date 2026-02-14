import { BattleTreeModifierContext } from './BattleTreeModifierContext';
import { BattleTreeEffect } from './BattleTreeEffect';
import { BattleTreeSequenceState } from '../BattleTreeSequence';

export const BATTLE_TREE_MODIFIER_DEFAULT_WEIGHT = 1;

export type BattleTreeModifierSource = 'player' | 'system';
export type BattleTreeModifierOperation = 'additive' | 'multiplicative';
export type BattleTreeModifierNameType = 'forfeit' | 'first_aid' | 'attack_10' | 'defense_10' | 'speed_10' | 'max_hitpoints_10' | 'level_5' | 'fast_start' | 'tick_heal' | 'challenge_accepted' | 'times_up' | 'modifier_1';

export type StageData = {
    acquiredStage: number;
};

export type TimeData = {
    acquiredSequenceTime: number;
    acquiredCombatTime: number;
};

export type PulseData = {
    pulsesFired: number;
    pulseTimer: number;
};

export interface BattleTreeModifierDefinitionSaveData<Data = unknown> {
    id: BattleTreeModifierNameType;
    data: Data;
}

export interface TickData {
    sequenceDeltaTime: number;
    combatDeltaTime: number;
}

export type BattleTreeModifierDescription<Data = unknown> = string | ((data: Data) => string);

export interface BattleTreeModifierDefinition<Data = unknown> {
    id: BattleTreeModifierNameType;
    name: string;
    description: BattleTreeModifierDescription;
    weight?: number;
    stack?: { max: number };

    canOffer?: (ctx: BattleTreeModifierContext) => boolean;

    onAcquire?: (ctx: BattleTreeModifierContext) => void;
    onStageStart?: (ctx: BattleTreeModifierContext) => void;
    onTick?: (ctx: BattleTreeModifierContext, data: { definitionData: Data, tickData: TickData }) => void;

    stateScope?: BattleTreeSequenceState[];
    effects?: BattleTreeEffect<Data>[];

    createData?: (ctx: BattleTreeModifierContext) => Data;

    toJSON?: (data: Data) => unknown | undefined;
    fromJSON?: (raw: unknown) => Data;
}

const TickHeal: BattleTreeModifierDefinition<TimeData & PulseData> = {
    id: 'tick_heal',
    name: 'Tick Heal',
    description: 'Heal all your pokemon 5 HP every 2 seconds of combat, up to 10 times.',
    weight: 1,
    // stateScope: [BattleTreeSequenceState.BATTLE],
    onTick: (ctx, { definitionData, tickData }) => {
        definitionData.pulseTimer += tickData.combatDeltaTime;

        const PULSE_DELAY = 0.5;

        if (definitionData.pulseTimer >= PULSE_DELAY && definitionData.pulsesFired < 100) {
            ctx.sequence.teams.Team_A.list.forEach(p => p.heal({ flat: 1 }));
            definitionData.pulseTimer -= PULSE_DELAY;
            definitionData.pulsesFired += 1;
        }
    },
    createData: ctx => ({
        acquiredSequenceTime: ctx.sequence.sequenceTime,
        acquiredCombatTime: ctx.sequence.combatTime,
        pulsesFired: 0,
        pulseTimer: 0,
    }),
    fromJSON: (raw: TimeData & PulseData | undefined) => ({
        pulsesFired: raw?.pulsesFired ?? 0,
        pulseTimer: raw?.pulseTimer ?? 0,
        acquiredSequenceTime: raw?.acquiredSequenceTime ?? 0,
        acquiredCombatTime: raw?.acquiredCombatTime ?? 0,
    }),
};

const TimesUp: BattleTreeModifierDefinition<TimeData> = {
    id: 'times_up',
    name: 'Time\'s up',
    description: 'You get 5 more minutes of combat time. After that the run ends.',
    weight: 1,
    // stateScope: [BattleTreeSequenceState.BATTLE],
    onTick: (ctx, { definitionData }) => {
        if (ctx.sequence.combatTime > definitionData.acquiredCombatTime + 30) {
            ctx.endSequence('Time\'s up');
        }
    },
    createData: ctx => ({
        acquiredSequenceTime: ctx.sequence.sequenceTime,
        acquiredCombatTime: ctx.sequence.combatTime,
    }),
    fromJSON: (raw: TimeData | undefined) => ({
        acquiredSequenceTime: raw?.acquiredSequenceTime ?? 0,
        acquiredCombatTime: raw?.acquiredCombatTime ?? 0,
    }),
};

const ChallengeAccepted: BattleTreeModifierDefinition<StageData> = {
    id: 'challenge_accepted',
    name: 'Challenge Accepted',
    description: (data: StageData) => `Rewards are reduced by 90%. Reach stage ${data.acquiredStage + 20}.`,
    weight: 1,
    effects: [{
        target: { key: 'rewards' },
        value: (ctx, data) => ctx.sequence.stage >= data.acquiredStage + 20 ? 1 : 0.1,
        operation: 'multiplicative',
    }],
    createData: ctx => ({
        acquiredStage: ctx.sequence.stage,
    }),
    fromJSON: (raw: StageData | undefined) => ({
        acquiredStage: raw?.acquiredStage ?? 0,
    }),
};

export const BattleTreeModifiers: BattleTreeModifierDefinition[] = [
    TickHeal,
    ChallengeAccepted,
    TimesUp,
    {
        id: 'forfeit',
        name: 'Forfeit',
        description: 'End the run. Forfeit 75% of your rewards',
        weight: 0, // System triggered,
        stack: { max: 1 },
        onAcquire: ctx => {
            ctx.endSequence('Forfeiting');
        },
        effects: [{ target: { key: 'rewards' }, value: 0.25, operation: 'multiplicative' }],
    },
    {
        id: 'first_aid',
        name: 'First aid',
        description: 'Heal for 20%',
        weight: 1,
        stack: { max: 1 },
        onAcquire: ctx => {
            ctx.sequence.teams.Team_A.list.forEach(p => p.heal({ percentage: 0.2 }));
        },
    },
    {
        id: 'attack_10',
        name: 'Attack 10',
        description: 'Gain +10% attack',
        weight: 1,
        stack: { max: 5 },
        effects: [{ target: { key: 'attack', scope: ['Team_A'] }, value: 1.1, operation: 'multiplicative' }],
    },
    {
        id: 'defense_10',
        name: 'Defense 10',
        description: 'Gain +10% defense',
        weight: 1,
        stack: { max: 5 },
        effects: [{ target: { key: 'defense', scope: ['Team_A'] }, value: 1.1, operation: 'multiplicative' }],
    },
    {
        id: 'speed_10',
        name: 'Speed 10',
        description: 'Gain +10% speed',
        weight: 1,
        stack: { max: 5 },
        effects: [{ target: { key: 'speed', scope: ['Team_A'] }, value: 1.1, operation: 'multiplicative' }],
    },
    {
        id: 'level_5',
        name: 'Level 5',
        description: 'Gain +5 pokemon levels',
        weight: 1,
        stack: { max: 5 },
        effects: [{ target: { key: 'level', scope: ['Team_A'] }, value: 5, operation: 'additive' }],
    },
    {
        id: 'max_hitpoints_10',
        name: 'Max hitpoints 10',
        description: 'Gain +10 Max Hitpoints',
        weight: 1,
        stack: { max: 5 },
        effects: [{ target: { key: 'max_hitpoints', scope: ['Team_A'] }, value: 10, operation: 'additive' }],
    },
    {
        id: 'fast_start',
        name: 'Triple Game Speed',
        description: 'While below stage 50, gain x3 game speed',
        weight: 1,
        stack: { max: 1 },
        effects: [{ target: { key: 'game_speed' }, value: 3, operation: 'multiplicative' }],
    },
    {
        id: 'modifier_1',
        name: '+1 Modifier',
        description: 'Gain +1 modifier option when selectin a modifier.',
        weight: 1,
        stack: { max: 1 },
        effects: [{ target: { key: 'modifier_count' }, value: 1, operation: 'additive' }],
    },
];
