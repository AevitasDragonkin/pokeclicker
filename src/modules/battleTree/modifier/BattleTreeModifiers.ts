import { BattleTreeModifierContext } from './BattleTreeModifierContext';
import { BattleTreeEffect } from './BattleTreeEffect';
import Requirement from '../../requirements/Requirement';
import {
    BattleTreeAutoPickRequirement,
    BattleTreeHighestStageRequirement, BattleTreeLevelRequirement,
    BattleTreeTeamSizeRequirement,
} from '../requirements/BattleTreeRequirements';
import { BattleTreeSequenceState } from '../types';
import { BattleTreeModifierNameType } from './BattleTreeModifierNameType';
import { AchievementOption, formatDuration } from '../../GameConstants';
import { pokemonMap } from '../../pokemons/PokemonList';
import PokemonType from '../../enums/PokemonType';
import DevelopmentRequirement from '../../requirements/DevelopmentRequirement';
import {BattleTreePokemon} from '../BattleTreePokemon';

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

const developmentGameSpeed: BattleTreeModifierDefinition = {
    id: 'development_game_speed',
    name: 'Development Game Speed x1.5',
    description: '[DEV] Gain x1.5 game speed',
    weight: 0,
    effects: [{ target: { key: 'game_speed' }, value: 1.5, operation: 'multiplicative' }],
    requirement: new DevelopmentRequirement(),
};

const playerAttack1: BattleTreeModifierDefinition = {
    id: 'player_attack_1',
    name: 'Attack+',
    description: 'All your Pokémon gain 12.5% attack',
    image: 'assets/images/battleTree/modifiers/player_attack_1.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'attack', scope: ['Team_A'] }, value: 1.125, operation: 'multiplicative' }],
};

const playerAttack2: BattleTreeModifierDefinition = {
    id: 'player_attack_2',
    name: 'Attack++',
    description: 'All your Pokémon gain 18.75% attack',
    image: 'assets/images/battleTree/modifiers/player_attack_2.png',
    weight: 1,
    stack: { max: 3 },
    effects: [{ target: { key: 'attack', scope: ['Team_A'] }, value: 1.1875, operation: 'multiplicative' }],
};

const playerAttack3: BattleTreeModifierDefinition = {
    id: 'player_attack_3',
    name: 'Attack+++',
    description: 'All your Pokémon gain 25% attack',
    image: 'assets/images/battleTree/modifiers/player_attack_3.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'attack', scope: ['Team_A'] }, value: 1.25, operation: 'multiplicative' }],
};

const playerDefense1: BattleTreeModifierDefinition = {
    id: 'player_defense_1',
    name: 'Defense+',
    description: 'All your Pokémon gain 12.5% defense',
    image: 'assets/images/battleTree/modifiers/player_defense_1.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'defense', scope: ['Team_A'] }, value: 1.125, operation: 'multiplicative' }],
};

const playerDefense2: BattleTreeModifierDefinition = {
    id: 'player_defense_2',
    name: 'Defense++',
    description: 'All your Pokémon gain 18.75% defense',
    image: 'assets/images/battleTree/modifiers/player_defense_2.png',
    weight: 1,
    stack: { max: 3 },
    effects: [{ target: { key: 'defense', scope: ['Team_A'] }, value: 1.1875, operation: 'multiplicative' }],
};

const playerDefense3: BattleTreeModifierDefinition = {
    id: 'player_defense_3',
    name: 'Defense+++',
    description: 'All your Pokémon gain 25% defense',
    image: 'assets/images/battleTree/modifiers/player_defense_3.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'defense', scope: ['Team_A'] }, value: 1.25, operation: 'multiplicative' }],
};

const playerSpeed1: BattleTreeModifierDefinition = {
    id: 'player_speed_1',
    name: 'Speed+',
    description: 'All your Pokémon gain 10% speed',
    image: 'assets/images/battleTree/modifiers/player_speed_1.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'speed', scope: ['Team_A'] }, value: 1.1, operation: 'multiplicative' }],
};

const playerSpeed2: BattleTreeModifierDefinition = {
    id: 'player_speed_2',
    name: 'Speed++',
    description: 'All your Pokémon gain 15% speed',
    image: 'assets/images/battleTree/modifiers/player_speed_2.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'speed', scope: ['Team_A'] }, value: 1.15, operation: 'multiplicative' }],
};

const playerSpeed3: BattleTreeModifierDefinition = {
    id: 'player_speed_3',
    name: 'Speed+++',
    description: 'All your Pokémon gain 20% speed',
    image: 'assets/images/battleTree/modifiers/player_speed_3.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'speed', scope: ['Team_A'] }, value: 1.2, operation: 'multiplicative' }],
};

const playerMaxHP1: BattleTreeModifierDefinition = {
    id: 'player_max_hp_1',
    name: 'Maximum HP+',
    description: 'All your Pokémon gain 10% maximum hitpoints',
    image: 'assets/images/battleTree/modifiers/player_max_hp_1.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_A'] }, value: 1.1, operation: 'multiplicative' }],
};

const playerMaxHP2: BattleTreeModifierDefinition = {
    id: 'player_max_hp_2',
    name: 'Maximum HP++',
    description: 'All your Pokémon gain 15% maximum hitpoints',
    image: 'assets/images/battleTree/modifiers/player_max_hp_2.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_A'] }, value: 1.15, operation: 'multiplicative' }],
};

const playerMaxHP3: BattleTreeModifierDefinition = {
    id: 'player_max_hp_3',
    name: 'Maximum HP+++',
    description: 'All your Pokémon gain 20% maximum hitpoints',
    image: 'assets/images/battleTree/modifiers/player_max_hp_3.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_A'] }, value: 1.2, operation: 'multiplicative' }],
};

const playerLevel1: BattleTreeModifierDefinition = {
    id: 'player_level_1',
    name: 'Level+',
    description: 'All your Pokémon gain 3 levels',
    image: 'assets/images/battleTree/modifiers/player_level_1.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'level', scope: ['Team_A'] }, value: 3, operation: 'additive' }],
};

const playerLevel2: BattleTreeModifierDefinition = {
    id: 'player_level_2',
    name: 'Level++',
    description: 'All your Pokémon gain 5 levels',
    image: 'assets/images/battleTree/modifiers/player_level_2.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'level', scope: ['Team_A'] }, value: 5, operation: 'additive' }],
};

const playerLevel3: BattleTreeModifierDefinition = {
    id: 'player_level_3',
    name: 'Level+++',
    description: 'All your Pokémon gain 10 levels',
    image: 'assets/images/battleTree/modifiers/player_level_3.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'level', scope: ['Team_A'] }, value: 10, operation: 'additive' }],
};

const enemyAttack1: BattleTreeModifierDefinition = {
    id: 'enemy_attack_1',
    name: 'Opponent Attack+',
    description: 'All your opponents\' Pokémon gain 12.5% attack',
    image: 'assets/images/battleTree/modifiers/enemy_attack_1.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'attack', scope: ['Team_B'] }, value: 1.125, operation: 'multiplicative' }],
};

const enemyAttack2: BattleTreeModifierDefinition = {
    id: 'enemy_attack_2',
    name: 'Opponent Attack++',
    description: 'All your opponents\' Pokémon gain 18.75% attack',
    image: 'assets/images/battleTree/modifiers/enemy_attack_2.png',
    weight: 1,
    stack: { max: 3 },
    effects: [{ target: { key: 'attack', scope: ['Team_B'] }, value: 1.1875, operation: 'multiplicative' }],
};

const enemyAttack3: BattleTreeModifierDefinition = {
    id: 'enemy_attack_3',
    name: 'Opponent Attack+++',
    description: 'All your opponents\' Pokémon gain 25% attack',
    image: 'assets/images/battleTree/modifiers/enemy_attack_3.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'attack', scope: ['Team_B'] }, value: 1.25, operation: 'multiplicative' }],
};

const enemyDefense1: BattleTreeModifierDefinition = {
    id: 'enemy_defense_1',
    name: 'Opponent Defense+',
    description: 'All your opponents\' Pokémon gain 12.5% defense',
    image: 'assets/images/battleTree/modifiers/enemy_defense_1.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'defense', scope: ['Team_B'] }, value: 1.125, operation: 'multiplicative' }],
};

const enemyDefense2: BattleTreeModifierDefinition = {
    id: 'enemy_defense_2',
    name: 'Opponent Defense++',
    description: 'All your opponents\' Pokémon gain 18.75% defense',
    image: 'assets/images/battleTree/modifiers/enemy_defense_2.png',
    weight: 1,
    stack: { max: 3 },
    effects: [{ target: { key: 'defense', scope: ['Team_B'] }, value: 1.1875, operation: 'multiplicative' }],
};

const enemyDefense3: BattleTreeModifierDefinition = {
    id: 'enemy_defense_3',
    name: 'Opponent Defense+++',
    description: 'All your opponents\' Pokémon gain 25% defense',
    image: 'assets/images/battleTree/modifiers/enemy_defense_3.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'defense', scope: ['Team_B'] }, value: 1.25, operation: 'multiplicative' }],
};

const enemySpeed1: BattleTreeModifierDefinition = {
    id: 'enemy_speed_1',
    name: 'Opponent Speed+',
    description: 'All your opponents\' Pokémon gain 10% speed',
    image: 'assets/images/battleTree/modifiers/enemy_speed_1.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'speed', scope: ['Team_B'] }, value: 1.1, operation: 'multiplicative' }],
};

const enemySpeed2: BattleTreeModifierDefinition = {
    id: 'enemy_speed_2',
    name: 'Opponent Speed++',
    description: 'All your opponents\' Pokémon gain 15% speed',
    image: 'assets/images/battleTree/modifiers/enemy_speed_2.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'speed', scope: ['Team_B'] }, value: 1.15, operation: 'multiplicative' }],
};

const enemySpeed3: BattleTreeModifierDefinition = {
    id: 'enemy_speed_3',
    name: 'Opponent Speed+++',
    description: 'All your opponents\' Pokémon gain 20% speed',
    image: 'assets/images/battleTree/modifiers/enemy_speed_3.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'speed', scope: ['Team_B'] }, value: 1.2, operation: 'multiplicative' }],
};

const enemyMaxHP1: BattleTreeModifierDefinition = {
    id: 'enemy_max_hp_1',
    name: 'Opponent Maximum HP+',
    description: 'All your opponents\' Pokémon gain 10% maximum hitpoints',
    image: 'assets/images/battleTree/modifiers/enemy_max_hp_1.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_B'] }, value: 1.1, operation: 'multiplicative' }],
};

const enemyMaxHP2: BattleTreeModifierDefinition = {
    id: 'enemy_max_hp_2',
    name: 'Opponent Maximum HP++',
    description: 'All your opponents\' Pokémon gain 15% maximum hitpoints',
    image: 'assets/images/battleTree/modifiers/enemy_max_hp_2.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_B'] }, value: 1.15, operation: 'multiplicative' }],
};

const enemyMaxHP3: BattleTreeModifierDefinition = {
    id: 'enemy_max_hp_3',
    name: 'Opponent Maximum HP+++',
    description: 'All your opponents\' Pokémon gain 20% maximum hitpoints',
    image: 'assets/images/battleTree/modifiers/enemy_max_hp_3.png',
    weight: 1,
    stack: { max: 5 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_B'] }, value: 1.2, operation: 'multiplicative' }],
};

const enemyLevel1: BattleTreeModifierDefinition = {
    id: 'enemy_level_1',
    name: 'Opponent Level+',
    description: 'All your opponents\' Pokémon gain 3 levels',
    image: 'assets/images/battleTree/modifiers/enemy_level_1.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'level', scope: ['Team_B'] }, value: 3, operation: 'additive' }],
};

const enemyLevel2: BattleTreeModifierDefinition = {
    id: 'enemy_level_2',
    name: 'Opponent Level++',
    description: 'All your opponents\' Pokémon gain 5 levels',
    image: 'assets/images/battleTree/modifiers/enemy_level_2.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'level', scope: ['Team_B'] }, value: 5, operation: 'additive' }],
};

const enemyLevel3: BattleTreeModifierDefinition = {
    id: 'enemy_level_3',
    name: 'Opponent Level+++',
    description: 'All your opponents\' Pokémon gain 10 levels',
    image: 'assets/images/battleTree/modifiers/enemy_level_3.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'level', scope: ['Team_B'] }, value: 10, operation: 'additive' }],
};

const healPotion: BattleTreeModifierDefinition = {
    id: 'heal_potion',
    name: 'Potion',
    description: 'Restore 20 HP to your active Pokémon',
    image: 'assets/images/battleTree/modifiers/potion.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.fight.pokemonA.heal({ flat: 20 }),
};

const healPotionSuper: BattleTreeModifierDefinition = {
    id: 'heal_potion_super',
    name: 'Super Potion',
    description: 'Restore 60 HP to your active Pokémon',
    image: 'assets/images/battleTree/modifiers/super_potion.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.fight.pokemonA.heal({ flat: 50 }),
};

const healPotionHyper: BattleTreeModifierDefinition = {
    id: 'heal_potion_hyper',
    name: 'Hyper Potion',
    description: 'Restore 200 HP to your active Pokémon',
    image: 'assets/images/battleTree/modifiers/hyper_potion.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.fight.pokemonA.heal({ flat: 200 }),
};

const healPotionMax: BattleTreeModifierDefinition = {
    id: 'heal_potion_max',
    name: 'Max Potion',
    description: 'Fully heal your active Pokémon',
    image: 'assets/images/battleTree/modifiers/max_potion.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.fight.pokemonA.heal({ percentage: 1 }),
};

const fullHeal: BattleTreeModifierDefinition = {
    id: 'full_heal',
    name: 'Full Heal Potion',
    description: 'Heal all your Pokémon for 33% HP',
    image: 'assets/images/battleTree/modifiers/full_heal.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.teams.Team_A.list.forEach(p => p.heal({ percentage: 0.33 })),
};

const revive: BattleTreeModifierDefinition = {
    id: 'revive',
    name: 'Revive',
    description: 'Revive all fainted Pokémon and heal your entire team for 15% HP',
    image: 'assets/images/battleTree/modifiers/revive.png',
    weight: 1,
    stack: { max: 1 },
    onAcquire: ctx => ctx.sequence.teams.Team_A.list.forEach(p => p.heal({ percentage: 0.15, allowRevive: true })),
};

const healOverTime: BattleTreeModifierDefinition<TimeData & PulseData> = {
    id: 'heal_over_time',
    name: 'Heal over time',
    description: 'Your team heals 5% HP every 5 seconds of battle time, up to 15 times',
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
    description: (ctx, data: StageData) => ctx ? `For the next ${CHALLENGE_ACCEPTED_ADDITIONAL_STAGES} platforms, losing reduces your rewards by 90%. Clear them to gain 15% more rewards. (Reach platform ${data.acquiredStage + CHALLENGE_ACCEPTED_ADDITIONAL_STAGES})` : `For the next ${CHALLENGE_ACCEPTED_ADDITIONAL_STAGES} platforms, losing reduces your rewards by 90%. Clear them to gain 15% more rewards.`,
    image: 'assets/images/battleTree/modifiers/challenge.png',
    weight: 1,
    effects: [{
        target: { key: 'rewards' },
        value: (ctx, data) => ctx.sequence.stage > data.acquiredStage + CHALLENGE_ACCEPTED_ADDITIONAL_STAGES ? 1.15 : 0.1,
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
        value: ctx => ctx.sequence.stage <= FAST_START_STAGE_REQUIREMENT ? 3 : 1,
        operation: 'multiplicative',
    }],
};

const additionalModifier: BattleTreeModifierDefinition = {
    id: 'additional_modifier',
    name: 'Options+',
    description: 'Gain 1 additional modifier option whenever you choose a modifier',
    image: 'assets/images/battleTree/modifiers/additional_modifier.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'modifier_count' }, value: 1, operation: 'additive' }],
};

const basketOfBalls: BattleTreeModifierDefinition = {
    id: 'ball_basket',
    name: 'Basket of Balls',
    description: 'Earn 5 random Poké Balls',
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
    description: 'Opponent Pokémon take 90% less post-type damage',
    image: 'assets/images/battleTree/modifiers/tank.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'damage_taken_after_types', scope: ['Team_B'] }, value: 0.1, operation: 'multiplicative' }],
};

const increaseEnemyTeamSize: BattleTreeModifierDefinition = {
    id: 'inc_enemy_team_size',
    name: 'Horde Battle',
    description: 'Your opponent brings 1 additional Pokémon',
    image: 'assets/images/battleTree/modifiers/inc_enemy_team_size.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'max_team_size', scope: ['Team_B'] }, value: 1, operation: 'additive' }],
};

const glassCannon: BattleTreeModifierDefinition = {
    id: 'glass_cannon',
    name: 'Glass cannon',
    description: 'Your Pokémon deal 10x damage, but they faint when they take any damage',
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
    description: 'Opponent Pokémon always attack first, but their Defense is reduced by 15%',
    image: 'assets/images/battleTree/modifiers/enemy_priority.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'speed', scope: ['Team_B'] }, value: Infinity, operation: 'final' },
        { target: { key: 'defense', scope: ['Team_B'] }, value: 0.85, operation: 'multiplicative' },
    ],
};

const rewardsVsSpeed: BattleTreeModifierDefinition = {
    id: 'rewards_vs_speed',
    name: 'Rewards vs Speed',
    description: 'Gain 25% more rewards, but the Battle Climb runs 15% slower',
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
    description: (ctx, { acquiredBattleTime }: TimeData) => ctx ? `Opponent Pokémon gain 1 Attack for every second of battle time after this modifier is taken (+${Math.floor(ctx.sequence.battleTime - acquiredBattleTime)})` : 'Opponent Pokémon gain 1 Attack for every second of battle time after this modifier is taken',
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
    description: 'Double your rewards, then immediately end the Battle Climb',
    image: 'assets/images/battleTree/modifiers/cash_in.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'rewards' }, value: 2, operation: 'multiplicative' }],
    onAcquire: ctx => ctx.endSequence('Cash In'),
};

const enemiesExtraStatsPerStage: BattleTreeModifierDefinition<StageData> = {
    id: 'enemies_extra_stats_per_stage',
    name: 'Growing enemies',
    description: (ctx, { acquiredStage }: StageData) => ctx ? `Enemies will gain +5 Attack, Defense, Speed and Maximum Hitpoints for each platform after this modifier is taken (${5 * (ctx.sequence.stage - acquiredStage)})` : 'Enemies will gain +5 Attack, Defense, Speed and Maximum Hitpoints for each platform after this modifier is taken',
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
    description: (ctx, { acquiredStage }: StageData) => ctx ? `All Pokémon lose 1% attack speed for each platform after this modifier is taken (x${(0.99 ** (ctx.sequence.stage - acquiredStage)).toFixed(4)})` : 'All Pokémon lose 1% attack speed for each platform after this modifier is taken',
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
    description: 'Pokémon deal 100% more damage for each fainted Pokémon on their team',
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
    description: (ctx, { acquiredBattleTime }: TimeData) => ctx ? `Your Pokémon lose 1 maximum HP for every 5 seconds of battle time after this modifier is taken (${-1 * Math.floor((ctx.sequence.battleTime - acquiredBattleTime) / 5)})` : 'Your Pokémon lose 1 maximum HP for every 5 seconds of battle time after this modifier is taken',
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
    description: ctx => ctx ? `All your opponents\' Pokémon gain +10 Maximum Hitpoints for every 30 seconds you spend picking Modifiers (+${10 * Math.floor(ctx.sequence.modifierTime / 30)})` : 'All your opponents\' Pokémon gain +10 Maximum Hitpoints for every 30 seconds you spend picking Modifiers',
    image: 'assets/images/battleTree/modifiers/no_time_to_think.png',
    weight: 1,
    stack: { max: 1 },
    effects: [{ target: { key: 'max_hitpoints', scope: ['Team_B'] }, value: ctx => 10 * Math.floor(ctx.sequence.modifierTime / 30), operation: 'additive' }],
};

const REWIND_STAGES: number = 15;
const rewind: BattleTreeModifierDefinition = {
    id: 'rewind',
    name: 'Rewind',
    description: ctx => ctx ? `Move back ${REWIND_STAGES} platforms (platform ${ctx.sequence.stage - REWIND_STAGES})` : `Move back ${REWIND_STAGES} platforms`,
    image: 'assets/images/battleTree/modifiers/reset_stages.png',
    weight: 1,
    stack: { max: 1 },
    requirement: new BattleTreeHighestStageRequirement(30, 'per_sequence'),
    effects: [{ target: { key: 'stage' }, value: -REWIND_STAGES, operation: 'additive' }],
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

const loneWolf: BattleTreeModifierDefinition = {
    id: 'lone_wolf',
    name: 'Lone wolf',
    description: 'If you have only one Pokémon on your team, it gains 100% to all stats and 5% life steal',
    image: 'assets/images/battleTree/modifiers/lone_wolf.png',
    weight: 1,
    stack: { max: 1 },
    requirement: new BattleTreeTeamSizeRequirement(1, AchievementOption.equal, 'Team_A'),
    effects: [
        { target: { key: 'attack', scope: ['Team_A'] }, value: ctx => ctx.sequence.teams.Team_A.list.length === 1 ? 2 : 1, operation: 'multiplicative' },
        { target: { key: 'defense', scope: ['Team_A'] }, value: ctx => ctx.sequence.teams.Team_A.list.length === 1 ? 2 : 1, operation: 'multiplicative' },
        { target: { key: 'speed', scope: ['Team_A'] }, value: ctx => ctx.sequence.teams.Team_A.list.length === 1 ? 2 : 1, operation: 'multiplicative' },
        { target: { key: 'life_steal_percertage', scope: ['Team_A'] }, value: ctx => ctx.sequence.teams.Team_A.list.length === 1 ? 0.05 : 0, operation: 'additive' },
    ],
};

const purist: BattleTreeModifierDefinition = {
    id: 'purist',
    name: 'Purist',
    description: 'If every Pokémon on the team has only one type, the Pokémon\'s type-effectiveness multipliers are increased by 0.5',
    image: 'assets/images/battleTree/modifiers/purist.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        // Type effectiveness is calculated by the defender
        { target: { key: 'type_effectiveness', scope: ['Team_A'] }, value: ctx => ctx.sequence.teams.Team_A.list.every(p => pokemonMap[p.name].type.length === 1) ? 0.5 : 0, operation: 'additive' },
        { target: { key: 'type_effectiveness', scope: ['Team_B'] }, value: ctx => ctx.sequence.teams.Team_B.list.every(p => pokemonMap[p.name].type.length === 1) ? 0.5 : 0, operation: 'additive' },
    ],
};

const blackSludge: BattleTreeModifierDefinition<TimeData & PulseData> = {
    id: 'black_sludge',
    name: 'Black Sludge',
    description: 'Opponent Pokémon heal 1% HP per second',
    image: 'assets/images/battleTree/modifiers/black_sludge.png',
    weight: 1,
    stack: { max: 1 },
    stateScope: [ BattleTreeSequenceState.BATTLE ],
    onTick: (ctx, { definitionData, tickData }) => {
        definitionData.pulseTimer += tickData.battleDeltaTime;

        const PULSE_DELAY = 1;

        if (definitionData.pulseTimer >= PULSE_DELAY) {
            ctx.sequence.teams.Team_B.list.forEach(p => p.heal({ percentage: 0.01 }));
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

const voltorb: BattleTreeModifierDefinition = {
    id: 'voltorb',
    name: 'Voltorb',
    description: 'Your active Pokémon takes 50 typeless damage',
    image: 'assets/images/battleTree/modifiers/voltorb.png',
    weight: 1,
    onAcquire: ctx => ctx.sequence.fight.pokemonA.takeDamage(undefined, undefined, { [PokemonType.None]: { [PokemonType.None]: 50 } }),
};

const giantSlayer: BattleTreeModifierDefinition = {
    id: 'giant_slayer',
    name: 'Giant Slayer',
    description: 'Your Pokémon deal 50% more damage to opposing Pokémon with higher maximum HP',
    image: 'assets/images/battleTree/modifiers/giant_slayer.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'damage_dealt_after_types', scope: ['Team_A'] }, value: ctx => ctx.sequence.fight.pokemonB.maxHitpoints > ctx.sequence.fight.pokemonA.maxHitpoints ? 1.5 : 1, operation: 'multiplicative' },
    ],
};

const davidGoliath: BattleTreeModifierDefinition = {
    id: 'david_goliath',
    name: 'David vs Goliath',
    description: 'All Pokémon deal 75% more damage damage to opposing Pokémon with higher maximum HP, and deal 75% less damage to opposing Pokémon with lower maximum HP',
    image: 'assets/images/battleTree/modifiers/david_goliath.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'damage_dealt_after_types', scope: ['Team_A'] }, value: ctx => ({ '-1': 0.25, '0': 1, '1': 1.75 })[Math.sign(ctx.sequence.fight.pokemonB.maxHitpoints - ctx.sequence.fight.pokemonA.maxHitpoints)], operation: 'multiplicative' },
        { target: { key: 'damage_dealt_after_types', scope: ['Team_B'] }, value: ctx => ({ '-1': 0.25, '0': 1, '1': 1.75 })[Math.sign(ctx.sequence.fight.pokemonA.maxHitpoints - ctx.sequence.fight.pokemonB.maxHitpoints)], operation: 'multiplicative' },
    ],
};

const nothing: BattleTreeModifierDefinition = {
    id: 'nothing',
    name: 'Nothing',
    description: 'This modifier has no effect',
    image: 'assets/images/battleTree/modifiers/nothing.png',
    weight: 1,
};

const bossRush: BattleTreeModifierDefinition = {
    id: 'boss_rush',
    name: 'Boss Rush',
    description: 'Skip 5 platforms, but opponent Pokémon gain 10% Attack, Defense, Speed, and maximum HP',
    image: 'assets/images/battleTree/modifiers/boss_rush.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'stage' }, value: 5, operation: 'additive' },
        { target: { key: 'attack', scope: ['Team_B'] }, value: 1.1, operation: 'multiplicative' },
        { target: { key: 'defense', scope: ['Team_B'] }, value: 1.1, operation: 'multiplicative' },
        { target: { key: 'speed', scope: ['Team_B'] }, value: 1.1, operation: 'multiplicative' },
        { target: { key: 'max_hitpoints', scope: ['Team_B'] }, value: 1.1, operation: 'multiplicative' },
    ],
};

const underleveled: BattleTreeModifierDefinition = {
    id: 'underleveled',
    name: 'Underleveled',
    description: 'Your Pokémon lose 5 levels. You gain 35% more rewards.',
    image: 'assets/images/battleTree/modifiers/underleveled.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'level', scope: ['Team_A'] }, value: -5, operation: 'additive' },
        { target: { key: 'rewards' }, value: 1.35, operation: 'multiplicative' },
    ],
    requirement: new BattleTreeLevelRequirement(10),
};

const warOfAttrition: BattleTreeModifierDefinition = {
    id: 'war_of_attrition',
    name: 'War of Attrition',
    description: 'Both teams take 25% less post-type damage. You gain 30% more rewards.',
    image: 'assets/images/battleTree/modifiers/war_of_attrition.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'damage_taken_after_types', scope: ['Team_A', 'Team_B'] }, value: 0.75, operation: 'multiplicative' },
        { target: { key: 'rewards' }, value: 1.3, operation: 'multiplicative' },
    ],
};

const heavyArmour: BattleTreeModifierDefinition = {
    id: 'heavy_armour',
    name: 'Heavy Armor',
    description: 'Your Pokémon gain 50% Defense and maximum HP, but lose 30% Speed.',
    image: 'assets/images/battleTree/modifiers/heavy_armour.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'defense', scope: ['Team_A'] }, value: 1.5, operation: 'multiplicative' },
        { target: { key: 'max_hitpoints', scope: ['Team_A'] }, value: 1.5, operation: 'multiplicative' },
        { target: { key: 'speed', scope: ['Team_A'] }, value: 0.7, operation: 'multiplicative' },
    ],
};

const vampire: BattleTreeModifierDefinition = {
    id: 'vampire',
    name: 'Vampire',
    description: 'Your Pokémon gain 10% life steal, but all their stats are reduced by 10%',
    image: 'assets/images/battleTree/modifiers/vampire.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'life_steal_percertage', scope: ['Team_A'] }, value: 0.1, operation: 'additive' },
        { target: { key: 'attack', scope: ['Team_A'] }, value: 0.9, operation: 'multiplicative' },
        { target: { key: 'defense', scope: ['Team_A'] }, value: 0.9, operation: 'multiplicative' },
        { target: { key: 'speed', scope: ['Team_A'] }, value: 0.9, operation: 'multiplicative' },
    ],
};

const absorb: BattleTreeModifierDefinition = {
    id: 'absorb',
    name: 'Absorb',
    description: 'Your Pokémon gain 1% life steal',
    image: 'assets/images/battleTree/modifiers/absorb.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'life_steal_percertage', scope: ['Team_A'] }, value: 0.01, operation: 'additive' },
    ],
};

const megaDrain: BattleTreeModifierDefinition = {
    id: 'mega_drain',
    name: 'Mega Drain',
    description: 'Your Pokémon gain 2.5% life steal',
    image: 'assets/images/battleTree/modifiers/mega_drain.png',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'life_steal_percertage', scope: ['Team_A'] }, value: 0.025, operation: 'additive' },
    ],
};

const balancedFn = (p?: BattleTreePokemon) => {
    if (!p) return false;
    const { attack, defense, speed } = p.base;
    return Math.max(attack, defense, speed) / Math.min(attack, defense, speed) <= 1.1;
};
const perfectBalance: BattleTreeModifierDefinition = {
    id: 'perfect_balance',
    name: 'Perfect Balance',
    description: 'Pokémon whose Attack, Defense, and Speed are within 10% of each other gain 50% to those stats',
    weight: 1,
    stack: { max: 1 },
    effects: [
        { target: { key: 'attack', scope: ['Team_A', 'Team_B'] }, value: (_ctx, _data, { pokemon }) => balancedFn(pokemon) ? 1.5 : 1, operation: 'multiplicative' },
        { target: { key: 'defense', scope: ['Team_A', 'Team_B'] }, value: (_ctx, _data, { pokemon }) => balancedFn(pokemon) ? 1.5 : 1, operation: 'multiplicative' },
        { target: { key: 'speed', scope: ['Team_A', 'Team_B'] }, value: (_ctx, _data, { pokemon }) => balancedFn(pokemon) ? 1.5 : 1, operation: 'multiplicative' },
    ],
};

export const BattleTreeModifiers: BattleTreeModifierDefinition[] = [
    // System modifiers
    forfeit,
    AutoPickModifiers,
    developmentGameSpeed,

    // Player picked
    playerAttack1,
    playerAttack2,
    playerAttack3,
    playerDefense1,
    playerDefense2,
    playerDefense3,
    playerSpeed1,
    playerSpeed2,
    playerSpeed3,
    playerMaxHP1,
    playerMaxHP2,
    playerMaxHP3,
    playerLevel1,
    playerLevel2,
    playerLevel3,
    enemyAttack1,
    enemyAttack2,
    enemyAttack3,
    enemyDefense1,
    enemyDefense2,
    enemyDefense3,
    enemySpeed1,
    enemySpeed2,
    enemySpeed3,
    enemyMaxHP1,
    enemyMaxHP2,
    enemyMaxHP3,
    enemyLevel1,
    enemyLevel2,
    enemyLevel3,
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
    rewind,
    skipStages,
    loneWolf,
    purist,
    blackSludge,
    voltorb,
    giantSlayer,
    davidGoliath,
    nothing,
    bossRush,
    underleveled,
    warOfAttrition,
    heavyArmour,
    vampire,
    absorb,
    megaDrain,
    perfectBalance,
];
