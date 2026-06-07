import { BattleTreeModifierContext } from './BattleTreeModifierContext';
import { BattleTreeEffect } from './BattleTreeEffect';
import Requirement from '../../requirements/Requirement';
import { BattleTreeAutoPickRequirement, BattleTreeHighestStageRequirement } from '../requirements/BattleTreeRequirements';
import { BattleTreeSequenceState } from '../types';
import { BattleTreeModifierNameType } from './BattleTreeModifierNameType';
import { formatDuration } from '../../GameConstants';

export const BATTLE_TREE_MODIFIER_DEFAULT_WEIGHT = 1;

export type BattleTreeModifierSource = 'player' | 'system';
export type BattleTreeModifierOperation = 'additive' | 'multiplicative';

export type StageData = {
    acquiredStage: number;
};

export type TimeData = {
    acquiredEngagementTime: number;
    acquiredBattleTime: number;
};

export type PulseData = {
    pulsesFired: number;
    pulseTimer: number;
};

export interface TickData {
    engagementDeltaTime: number;
    battleDeltaTime: number;
}

// export interface BattleTreeModifierDefinitionSaveData<Data = unknown> {
//     id: BattleTreeModifierNameType;
//     data: Data;
// }

export type BattleTreeModifierDescription<Data = unknown> = string | ((ctx: BattleTreeModifierContext, data: Data) => string);

export interface BattleTreeModifierDefinition<Data = unknown> {
    id: BattleTreeModifierNameType;
    name: string;
    description: BattleTreeModifierDescription;
    image?: string;
    weight?: number;
    stack?: { max: number };

    requirement?: Requirement;
    canOffer?: (ctx: BattleTreeModifierContext) => boolean;

    onAcquire?: (ctx: BattleTreeModifierContext) => void;
    onStageStart?: (ctx: BattleTreeModifierContext) => void;
    onTick?: (ctx: BattleTreeModifierContext, data: { definitionData: Data, tickData: TickData }) => void;

    stateScope?: BattleTreeSequenceState[];
    effects?: BattleTreeEffect<Data>[];

    createData?: (ctx: BattleTreeModifierContext) => Data;

    // toJSON?: (data: Data) => unknown | undefined;
    // fromJSON?: (raw: unknown) => Data;
}

const forfeit: BattleTreeModifierDefinition = {
    id: 'forfeit',
    name: 'Forfeit',
    description: 'Ends the Battle Climb immediately. Forfeit 75% of your rewards',
    image: 'assets/images/battleTree/modifiers/forfeit.png',
    weight: 0, // System triggered only
    stack: { max: 1 },
    onAcquire: ctx => ctx.endSequence('Forfeiting'),
    effects: [{ target: { key: 'rewards' }, value: 0.25, operation: 'multiplicative' }],
};

export const AutoPickModifiers: BattleTreeModifierDefinition = {
    id: 'auto_pick_modifiers',
    name: 'Auto pick modifiers',
    description: 'The system will select 1 modifier at random each time a modifier can be selected',
    image: 'assets/images/battleTree/modifiers/auto_pick_modifiers.png',
    weight: 0, // System triggered only
    stack: { max: 1 },
    effects: [{ target: { key: 'auto_pick_modifier' }, value: 1, operation: 'final' }],
    requirement: BattleTreeAutoPickRequirement,
};

const playerAttack10: BattleTreeModifierDefinition = {
    id: '10%_player_attack',
    name: '+10% Attack',
    description: 'All your pokemon gain 10% attack',
    image: 'assets/images/battleTree/modifiers/10_player_attack.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'attack', scope: ['Team_A'] }, value: 1.1, operation: 'multiplicative' }],
};

const playerDefense10: BattleTreeModifierDefinition = {
    id: '10%_player_defense',
    name: '+10% Defense',
    description: 'All your pokemon gain 10% defense',
    image: 'assets/images/battleTree/modifiers/10_player_defense.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'defense', scope: ['Team_A'] }, value: 1.1, operation: 'multiplicative' }],
};

const playerSpeed10: BattleTreeModifierDefinition = {
    id: '10%_player_speed',
    name: '+10% Speed',
    description: 'All your pokemon gain 10% speed',
    image: 'assets/images/battleTree/modifiers/10_player_speed.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'speed', scope: ['Team_A'] }, value: 1.1, operation: 'multiplicative' }],
};

const playerMaxHP10: BattleTreeModifierDefinition = {
    id: '10%_player_max_hp',
    name: '+10% Maximum Hitpoints',
    description: 'All your pokemon gain 10% maximum hitpoints',
    image: 'assets/images/battleTree/modifiers/10_player_max_hp.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_A'] }, value: 1.1, operation: 'multiplicative' }],
};

const enemyAttack10: BattleTreeModifierDefinition = {
    id: '10%_enemy_attack',
    name: '+10% Enemy Attack',
    description: 'All your opponents\' pokemon gain 10% attack',
    image: 'assets/images/battleTree/modifiers/10_enemy_attack.png',
    weight: 1,
    effects: [{ target: { key: 'attack', scope: ['Team_B'] }, value: 1.1, operation: 'multiplicative' }],
};

const enemyDefense10: BattleTreeModifierDefinition = {
    id: '10%_enemy_defense',
    name: '+10% Enemy Defense',
    description: 'All your opponents\' pokemon gain 10% defense',
    image: 'assets/images/battleTree/modifiers/10_enemy_defense.png',
    weight: 1,
    effects: [{ target: { key: 'defense', scope: ['Team_B'] }, value: 1.1, operation: 'multiplicative' }],
};

const enemySpeed10: BattleTreeModifierDefinition = {
    id: '10%_enemy_speed',
    name: '+10% Enemy Speed',
    description: 'All your opponents\' pokemon gain 10% speed',
    image: 'assets/images/battleTree/modifiers/10_enemy_speed.png',
    weight: 1,
    effects: [{ target: { key: 'speed', scope: ['Team_B'] }, value: 1.1, operation: 'multiplicative' }],
};

const enemyMaxHP10: BattleTreeModifierDefinition = {
    id: '10%_enemy_max_hp',
    name: '+10% Enemy Maximum Hitpoints',
    description: 'All your opponents\' pokemon gain 10% maximum hitpoints',
    image: 'assets/images/battleTree/modifiers/10_enemy_max_hp.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_B'] }, value: 1.1, operation: 'multiplicative' }],
};

const playerLevels5: BattleTreeModifierDefinition = {
    id: '5_player_levels',
    name: '+5 Pokemon levels',
    description: 'All your pokemon gain +5 levels',
    image: 'assets/images/battleTree/modifiers/5_player_levels.png',
    weight: 1,
    stack: { max: 3 },
    effects: [{ target: { key: 'level', scope: ['Team_A'] }, value: 5, operation: 'additive' }],
};

const playerLevels10: BattleTreeModifierDefinition = {
    id: '10_player_levels',
    name: '+10 Pokemon levels',
    description: 'All your pokemon gain +10 levels',
    image: 'assets/images/battleTree/modifiers/10_player_levels.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'level', scope: ['Team_A'] }, value: 10, operation: 'additive' }],
};

const enemyLevels15: BattleTreeModifierDefinition = {
    id: '15_enemy_levels',
    name: '+15 Enemy Pokemon levels',
    description: 'All your opponents\' pokemon gain +15 levels',
    image: 'assets/images/battleTree/modifiers/15_enemy_levels.png',
    weight: 1,
    stack: { max: 2 },
    effects: [{ target: { key: 'level', scope: ['Team_B'] }, value: 15, operation: 'additive' }],
};

const enemyLevelsMinus3: BattleTreeModifierDefinition = {
    id: '-3_enemy_levels',
    name: '-3 Opponent Pokemon levels',
    description: 'All your opponents\' pokemon gain -3 levels',
    image: 'assets/images/battleTree/modifiers/-3_enemy_levels.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'level', scope: ['Team_B'] }, value: -3, operation: 'additive' }],
};

const healPotion: BattleTreeModifierDefinition = {
    id: 'heal_potion',
    name: 'Potion',
    description: 'Restores 20 HP',
    image: 'assets/images/battleTree/modifiers/potion.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.fight.pokemonA.heal({ flat: 20 }),
};

const healPotionSuper: BattleTreeModifierDefinition = {
    id: 'heal_potion_super',
    name: 'Super Potion',
    description: 'Restores 50 HP',
    image: 'assets/images/battleTree/modifiers/super_potion.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.fight.pokemonA.heal({ flat: 50 }),
};

const healPotionHyper: BattleTreeModifierDefinition = {
    id: 'heal_potion_hyper',
    name: 'Hyper Potion',
    description: 'Restores 200 HP',
    image: 'assets/images/battleTree/modifiers/hyper_potion.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.fight.pokemonA.heal({ flat: 200 }),
};

const healPotionMax: BattleTreeModifierDefinition = {
    id: 'heal_potion_max',
    name: 'Max Potion',
    description: 'Restores 100% HP',
    image: 'assets/images/battleTree/modifiers/max_potion.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.fight.pokemonA.heal({ percentage: 1 }),
};

const fullHeal: BattleTreeModifierDefinition = {
    id: 'full_heal',
    name: 'Full Heal Potion',
    description: 'Restores 30% HP on all your pokemon (not fainted)',
    image: 'assets/images/battleTree/modifiers/full_heal.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.teams.Team_A.list.filter(p => p.hitpoints > 0).forEach(p => p.heal({ percentage: 0.3 })),
};

const revive: BattleTreeModifierDefinition = {
    id: 'revive',
    name: 'Revive',
    description: 'Revives all your pokemon. Restores 15% HP for your entire team.',
    image: 'assets/images/battleTree/modifiers/revive.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.teams.Team_A.list.forEach(p => p.heal({ percentage: 0.15 })),
};

const healOverTime: BattleTreeModifierDefinition<TimeData & PulseData> = {
    id: 'heal_over_time',
    name: 'Heal over time',
    description: 'Restores 5% HP every 5 seconds of Battle Time, up to 15 times.',
    image: 'assets/images/battleTree/modifiers/heal_over_time.png',
    weight: 1,
    stateScope: [BattleTreeSequenceState.BATTLE],
    onTick: (ctx, { definitionData, tickData }) => {
        definitionData.pulseTimer += tickData.battleDeltaTime;

        const PULSE_DELAY = 5;

        if (definitionData.pulseTimer >= PULSE_DELAY && definitionData.pulsesFired < 15) {
            ctx.sequence.teams.Team_A.list.forEach(p => p.heal({ percentage: 0.05 }));
            definitionData.pulseTimer -= PULSE_DELAY;
            ++definitionData.pulsesFired;
        }
    },
    createData: ctx => ({
        acquiredEngagementTime: ctx.sequence.engagementTime,
        acquiredBattleTime: ctx.sequence.battleTime,
        pulsesFired: 0,
        pulseTimer: 0,
    }),
};

const LIMITED_TIME_DURATION_IN_SECONDS: number = 300;
const limitedTime: BattleTreeModifierDefinition<TimeData> = {
    id: 'limited_time',
    name: 'Quickly now',
    description: (ctx, data: TimeData) => `${formatDuration(data.acquiredBattleTime + LIMITED_TIME_DURATION_IN_SECONDS - ctx.sequence.battleTime)} Battle time left until your Battle Climb ends`,
    image: 'assets/images/battleTree/modifiers/quickly_now.png',
    weight: 1,
    stateScope: [BattleTreeSequenceState.BATTLE],
    onTick: (ctx, { definitionData }) => {
        if (ctx.sequence.battleTime > definitionData.acquiredBattleTime + LIMITED_TIME_DURATION_IN_SECONDS) {
            ctx.endSequence('Time\'s up!');
        }
    },
    createData: ctx => ({
        acquiredEngagementTime: ctx.sequence.engagementTime,
        acquiredBattleTime: ctx.sequence.battleTime,
    }),
};

const CHALLENGE_ACCEPTED_ADDITIONAL_STAGES: number = 20;
const challengeAccepted: BattleTreeModifierDefinition<StageData> = {
    id: 'challenge_accepted',
    name: 'Challenge Accepted',
    description: (ctx, data: StageData) => `Your rewards are reduced by 90% until you defeat platform ${data.acquiredStage + CHALLENGE_ACCEPTED_ADDITIONAL_STAGES}`,
    image: 'assets/images/battleTree/modifiers/challenge.png',
    weight: 1,
    effects: [{
        target: { key: 'rewards' },
        value: (ctx, data) => ctx.sequence.stage > data.acquiredStage + CHALLENGE_ACCEPTED_ADDITIONAL_STAGES ? 1 : 0.1,
        operation: 'multiplicative',
    }],
    createData: ctx => ({
        acquiredStage: ctx.sequence.stage,
    }),
};

const FAST_START_STAGE_REQUIREMENT: number = 50;
const fastStart: BattleTreeModifierDefinition = {
    id: 'fast_start',
    name: 'Triple Game Speed',
    description: `While below platform ${FAST_START_STAGE_REQUIREMENT}, gain x3 game speed`,
    image: 'assets/images/battleTree/modifiers/triple_game_speed.png',
    weight: 1,
    stack: { max: 1 },
    requirement: new BattleTreeHighestStageRequirement(FAST_START_STAGE_REQUIREMENT, 'per_seed'),
    effects: [{
        target: { key: 'game_speed' },
        value: 3,
        operation: 'multiplicative',
    }],
};

const additionalModifier: BattleTreeModifierDefinition = {
    id: 'additional_modifier',
    name: '+1 Modifier',
    description: 'Gain +1 extra modifier option when picking a modifier',
    image: 'assets/images/battleTree/modifiers/additional_modifier.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'modifier_count' }, value: 1, operation: 'additive' }],
};

const basketOfBalls: BattleTreeModifierDefinition = {
    id: 'ball_basket',
    name: 'Basket of balls',
    description: 'Get 5 random pokeballs',
    image: 'assets/images/battleTree/modifiers/basket.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.rollPool('special_ball', undefined, 5),
};

const enragedEnemies: BattleTreeModifierDefinition = {
    id: 'enraged_enemies',
    name: 'Enraged enemies',
    description: 'Enemies deal x10 damage (after types)',
    image: 'assets/images/battleTree/modifiers/enrage.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'damage_dealt_after_types', scope: ['Team_B'] }, value: 10, operation: 'multiplicative' }],
};

const tankEnemies: BattleTreeModifierDefinition = {
    id: 'tank_enemies',
    name: 'Tank enemies',
    description: 'Enemies take 90% less damage (after types)',
    image: 'assets/images/battleTree/modifiers/tank.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'damage_taken_after_types', scope: ['Team_B'] }, value: 0.1, operation: 'multiplicative' }],
};

const increaseEnemyTeamSize: BattleTreeModifierDefinition = {
    id: 'inc_enemy_team_size',
    name: '+1 Enemies',
    description: 'Your opponent now uses 1 additional pokemon per platform',
    image: 'assets/images/battleTree/modifiers/inc_enemy_team_size.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'max_team_size', scope: ['Team_B'] }, value: 1, operation: 'additive' }],
};

const glassCannon: BattleTreeModifierDefinition = {
    id: 'glass_cannon',
    name: 'Glass cannon',
    description: 'Your pokemon deal x10 damage. They instantly faint when they take a hit.',
    image: 'assets/images/battleTree/modifiers/glass_cannon.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'damage_dealt_after_types', scope: ['Team_A'] }, value: 10, operation: 'multiplicative' },
        { target: { key: 'defense', scope: ['Team_A'] }, value: 0, operation: 'final' },
    ],
};

const enemyPriority: BattleTreeModifierDefinition = {
    id: 'enemy_priority',
    name: 'Enemy priority',
    description: 'Your opponents\' pokemon will always attack first',
    image: 'assets/images/battleTree/modifiers/enemy_priority.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'speed', scope: ['Team_B'] }, value: Infinity, operation: 'final' }],
};

const rewardsVsSpeed: BattleTreeModifierDefinition = {
    id: 'rewards_vs_speed',
    name: 'Rewards vs Speed',
    description: 'Gain 25% more rewards. Your Battle Climb will be 15% slower.',
    image: 'assets/images/battleTree/modifiers/rewards_vs_speed.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'rewards' }, value: 1.25, operation: 'multiplicative' },
        { target: { key: 'game_speed' }, value: 0.85, operation: 'multiplicative' },
    ],
};

const enemyAttackGrowth: BattleTreeModifierDefinition<TimeData> = {
    id: 'enemy_attack_growth',
    name: 'Enemy Attack Growth',
    description: (ctx, { acquiredBattleTime }: TimeData) => `Your opponents' pokemon gain +1 attack every second of Battle time (${Math.floor(ctx.sequence.battleTime - acquiredBattleTime)})`,
    image: 'assets/images/battleTree/modifiers/enemy_attack_growth.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{
        target: { key: 'attack', scope: ['Team_B'] },
        value: (ctx, { acquiredBattleTime }) => Math.floor(ctx.sequence.battleTime - acquiredBattleTime),
        operation: 'additive',
    }],
    createData: ctx => ({
        acquiredEngagementTime: ctx.sequence.engagementTime,
        acquiredBattleTime: ctx.sequence.battleTime,
    }),
};

const cashIn: BattleTreeModifierDefinition = {
    id: 'cash_in',
    name: 'Cash In',
    description: 'Double your rewards, end your Battle Climb',
    image: 'assets/images/battleTree/modifiers/cash_in.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'rewards' }, value: 2, operation: 'multiplicative' }],
    onAcquire: ctx => ctx.endSequence('Cash In'),
};

const enemiesExtraStatsPerStage: BattleTreeModifierDefinition<StageData> = {
    id: 'enemies_extra_stats_per_stage',
    name: 'Growing enemies',
    description: (ctx, { acquiredStage }: StageData) => `Enemies will gain +5 Attack, Defense, Speed and Maximum Hitpoints for each platform after this. (${5 * (ctx.sequence.stage - acquiredStage)})`,
    image: 'assets/images/battleTree/modifiers/enemies_extra_stats_per_stage.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'attack', scope: ['Team_B'] }, value: (ctx, data) => 5 * (ctx.sequence.stage - data.acquiredStage), operation: 'additive' },
        { target: { key: 'defense', scope: ['Team_B'] }, value: (ctx, data) => 5 * (ctx.sequence.stage - data.acquiredStage), operation: 'additive' },
        { target: { key: 'speed', scope: ['Team_B'] }, value: (ctx, data) => 5 * (ctx.sequence.stage - data.acquiredStage), operation: 'additive' },
        { target: { key: 'max_hitpoints', scope: ['Team_B'] }, value: (ctx, data) => 5 * (ctx.sequence.stage - data.acquiredStage), operation: 'additive' },
    ],
    createData: ctx => ({
        acquiredStage: ctx.sequence.stage,
    }),
};

const fatigue: BattleTreeModifierDefinition<StageData> = {
    id: 'fatigue',
    name: 'Fatigue',
    description: (ctx, { acquiredStage }: StageData) => `All pokemon attack speed decreases by 1% for each platform after this. (x${0.99 ** (ctx.sequence.stage - acquiredStage)})`,
    image: 'assets/images/battleTree/modifiers/fatigue.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'attack_speed' }, value: (ctx, { acquiredStage }) => 0.99 ** (ctx.sequence.stage - acquiredStage), operation: 'multiplicative' }],
    createData: ctx => ({
        acquiredStage: ctx.sequence.stage,
    }),
};

const vengeance: BattleTreeModifierDefinition = {
    id: 'vengeance',
    name: 'Vengeance',
    description: 'All pokemon gain 100% extra damage (after types) for each fainted team member',
    image: 'assets/images/battleTree/modifiers/vengeance.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'damage_dealt_after_types', scope: ['Team_A'] }, value: ctx => 1 + ctx.sequence.teams.Team_A.list.filter(p => p.hitpoints === 0).length, operation: 'multiplicative' },
        { target: { key: 'damage_dealt_after_types', scope: ['Team_B'] }, value: ctx => 1 + ctx.sequence.teams.Team_B.list.filter(p => p.hitpoints === 0).length, operation: 'multiplicative' },
    ],
};

const degradation: BattleTreeModifierDefinition<TimeData> = {
    id: 'degradation',
    name: 'Degradation',
    description: (ctx, { acquiredBattleTime }: TimeData) => `Your pokemon lose 1 Maximum Hitpoints for every 5 seconds of Battle time (${-1 * Math.floor((ctx.sequence.battleTime - acquiredBattleTime) / 5)})`,
    image: 'assets/images/battleTree/modifiers/degradation.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_A'] }, value: (ctx, { acquiredBattleTime }) => -1 * Math.floor((ctx.sequence.battleTime - acquiredBattleTime) / 5), operation: 'additive' }],
    createData: ctx => ({
        acquiredEngagementTime: ctx.sequence.engagementTime,
        acquiredBattleTime: ctx.sequence.battleTime,
    }),
};

const enemyMaxHPGainModifierTime: BattleTreeModifierDefinition = {
    id: 'enemy_max_hp_modifier_time',
    name: 'No time to think',
    description: ctx => `All your opponents\' pokemon gain +1 Maximum Hitpoints for every 3 seconds you spend picking Modifiers (+${Math.floor(ctx.sequence.modifierTime / 3)})`,
    image: 'assets/images/battleTree/modifiers/no_time_to_think.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_B'] }, value: ctx => Math.floor(ctx.sequence.modifierTime / 3), operation: 'additive' }],
};

const RESET_STAGES: number = 25;
const resetStages: BattleTreeModifierDefinition = {
    id: 'reset_stages_25',
    name: `Reset ${RESET_STAGES} stages`,
    description: ctx => `Return back to platform ${ctx.sequence.stage - RESET_STAGES}`,
    image: 'assets/images/battleTree/modifiers/reset_stages.png',
    weight: 1,
    stack: { max: 1 },
    requirement: new BattleTreeHighestStageRequirement(30, 'per_sequence'),
    effects: [{ target: { key: 'stage' }, value: -RESET_STAGES, operation: 'additive' }],
};

const SKIP_STAGES: number = 3;
const skipStages: BattleTreeModifierDefinition = {
    id: 'skip_stages_3',
    name: `Skip ${SKIP_STAGES} stages`,
    description: `Skip ${SKIP_STAGES} stages`,
    image: 'assets/images/battleTree/modifiers/skip_stages_3.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'stage' }, value: SKIP_STAGES, operation: 'additive' }],
};

export const BattleTreeModifiers: BattleTreeModifierDefinition[] = [
    // System modifiers
    forfeit,
    AutoPickModifiers,

    // Player picked
    playerAttack10,
    playerDefense10,
    playerSpeed10,
    playerMaxHP10,
    enemyAttack10,
    enemyDefense10,
    enemySpeed10,
    enemyMaxHP10,
    playerLevels5,
    playerLevels10,
    enemyLevels15,
    enemyLevelsMinus3,
    healPotion,
    healPotionSuper,
    healPotionHyper,
    healPotionMax,
    fullHeal,
    revive,
    healOverTime,
    limitedTime,
    challengeAccepted,
    fastStart,
    additionalModifier,
    basketOfBalls,
    enragedEnemies,
    tankEnemies,
    increaseEnemyTeamSize,
    glassCannon,
    enemyPriority,
    rewardsVsSpeed,
    enemyAttackGrowth,
    cashIn,
    enemiesExtraStatsPerStage,
    fatigue,
    vengeance,
    degradation,
    enemyMaxHPGainModifierTime,
    resetStages,
    skipStages,
];
