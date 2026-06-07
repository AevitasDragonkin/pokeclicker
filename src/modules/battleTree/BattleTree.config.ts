import {
    BattleTreePokemonSubset, BattleTreePokemonSubsetNameType,
    CustomBattleTreePokemonSubset,
    RegionBattleTreePokemonSubset,
    TypedBattleTreePokemonSubset,
} from './subset/BattleTreePokemonSubset';
import PokemonType from '../enums/PokemonType';
import { Region } from '../GameConstants';
import Requirement from '../requirements/Requirement';
import {
    BattleTreeAutoPickRequirement, BattleTreePowerUpLootRequirement,
    BattleTreePowerUpRequirement,
} from './requirements/BattleTreeRequirements';

export const subsets: Record<BattleTreePokemonSubsetNameType, BattleTreePokemonSubset> = {
    'All': new CustomBattleTreePokemonSubset({ name: 'All' }),
    'Kanto': new RegionBattleTreePokemonSubset({ name: 'Kanto', region: Region.kanto }),
    'Johto': new RegionBattleTreePokemonSubset({ name: 'Johto', region: Region.johto }),
    'Hoenn': new RegionBattleTreePokemonSubset({ name: 'Hoenn', region: Region.hoenn }),
    'Sinnoh': new RegionBattleTreePokemonSubset({ name: 'Sinnoh', region: Region.sinnoh }),
    'Unova': new RegionBattleTreePokemonSubset({ name: 'Unova', region: Region.unova }),
    'Kalos': new RegionBattleTreePokemonSubset({ name: 'Kalos', region: Region.kalos }),
    'Alola': new RegionBattleTreePokemonSubset({ name: 'Alola', region: Region.alola }),
    'Galar': new RegionBattleTreePokemonSubset({ name: 'Galar', region: Region.galar }),
    'Normal': new TypedBattleTreePokemonSubset({ name: 'Normal', type: PokemonType.Normal }),
    'Fire': new TypedBattleTreePokemonSubset({ name: 'Fire', type: PokemonType.Fire }),
    'Water': new TypedBattleTreePokemonSubset({ name: 'Water', type: PokemonType.Water }),
    'Electric': new TypedBattleTreePokemonSubset({ name: 'Electric', type: PokemonType.Electric }),
    'Grass': new TypedBattleTreePokemonSubset({ name: 'Grass', type: PokemonType.Grass }),
    'Ice': new TypedBattleTreePokemonSubset({ name: 'Ice', type: PokemonType.Ice }),
    'Fighting': new TypedBattleTreePokemonSubset({ name: 'Fighting', type: PokemonType.Fighting }),
    'Poison': new TypedBattleTreePokemonSubset({ name: 'Poison', type: PokemonType.Poison }),
    'Ground': new TypedBattleTreePokemonSubset({ name: 'Ground', type: PokemonType.Ground }),
    'Flying': new TypedBattleTreePokemonSubset({ name: 'Flying', type: PokemonType.Flying }),
    'Psychic': new TypedBattleTreePokemonSubset({ name: 'Psychic', type: PokemonType.Psychic }),
    'Bug': new TypedBattleTreePokemonSubset({ name: 'Bug', type: PokemonType.Bug }),
    'Rock': new TypedBattleTreePokemonSubset({ name: 'Rock', type: PokemonType.Rock }),
    'Ghost': new TypedBattleTreePokemonSubset({ name: 'Ghost', type: PokemonType.Ghost }),
    'Dragon': new TypedBattleTreePokemonSubset({ name: 'Dragon', type: PokemonType.Dragon }),
    'Dark': new TypedBattleTreePokemonSubset({ name: 'Dark', type: PokemonType.Dark }),
    'Steel': new TypedBattleTreePokemonSubset({ name: 'Steel', type: PokemonType.Steel }),
    'Fairy': new TypedBattleTreePokemonSubset({ name: 'Fairy', type: PokemonType.Fairy }),
    // 'Pure Normal': new TypedBattleTreePokemonSubset({ name: 'Pure Normal', type: PokemonType.Normal, monotype: true, customOpponentWeight: { 'Pure Ghost': 0 } }),
    // 'Pure Fire': new TypedBattleTreePokemonSubset({ name: 'Pure Fire', type: PokemonType.Fire, monotype: true }),
    // 'Pure Water': new TypedBattleTreePokemonSubset({ name: 'Pure Water', type: PokemonType.Water, monotype: true }),
    // 'Pure Electric': new TypedBattleTreePokemonSubset({ name: 'Pure Electric', type: PokemonType.Electric, monotype: true, customOpponentWeight: { 'Pure Ground': 0 } }),
    // 'Pure Grass': new TypedBattleTreePokemonSubset({ name: 'Pure Grass', type: PokemonType.Grass, monotype: true }),
    // 'Pure Ice': new TypedBattleTreePokemonSubset({ name: 'Pure Ice', type: PokemonType.Ice, monotype: true }),
    // 'Pure Fighting': new TypedBattleTreePokemonSubset({ name: 'Pure Fighting', type: PokemonType.Fighting, monotype: true, customOpponentWeight: { 'Pure Ghost': 0 } }),
    // 'Pure Poison': new TypedBattleTreePokemonSubset({ name: 'Pure Poison', type: PokemonType.Poison, monotype: true, customOpponentWeight: { 'Pure Steel': 0 } }),
    // 'Pure Ground': new TypedBattleTreePokemonSubset({ name: 'Pure Ground', type: PokemonType.Ground, monotype: true, customOpponentWeight: { 'Pure Flying': 0 } }),
    // 'Pure Flying': new TypedBattleTreePokemonSubset({ name: 'Pure Flying', type: PokemonType.Flying, monotype: true }),
    // 'Pure Psychic': new TypedBattleTreePokemonSubset({ name: 'Pure Psychic', type: PokemonType.Psychic, monotype: true, customOpponentWeight: { 'Pure Dark': 0 } }),
    // 'Pure Bug': new TypedBattleTreePokemonSubset({ name: 'Pure Bug', type: PokemonType.Bug, monotype: true }),
    // 'Pure Rock': new TypedBattleTreePokemonSubset({ name: 'Pure Rock', type: PokemonType.Rock, monotype: true }),
    // 'Pure Ghost': new TypedBattleTreePokemonSubset({ name: 'Pure Ghost', type: PokemonType.Ghost, monotype: true, customOpponentWeight: { 'Pure Normal': 0 } }),
    // 'Pure Dragon': new TypedBattleTreePokemonSubset({ name: 'Pure Dragon', type: PokemonType.Dragon, monotype: true, customOpponentWeight: { 'Pure Fairy': 0 } }),
    // 'Pure Dark': new TypedBattleTreePokemonSubset({ name: 'Pure Dark', type: PokemonType.Dark, monotype: true }),
    // 'Pure Steel': new TypedBattleTreePokemonSubset({ name: 'Pure Steel', type: PokemonType.Steel, monotype: true }),
    // 'Pure Fairy': new TypedBattleTreePokemonSubset({ name: 'Pure Fairy', type: PokemonType.Fairy, monotype: true }),
};

export const ProgressionLevelTable: { description: string; requirement: Requirement }[] = [
    { description: 'Auto-pick modifiers', requirement: BattleTreeAutoPickRequirement },
    { description: 'Gain moves', requirement: BattleTreePowerUpLootRequirement },
    { description: 'Equip moves', requirement: BattleTreePowerUpRequirement },
];
