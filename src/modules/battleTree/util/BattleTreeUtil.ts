import { BattleTreePokemonSubset, BattleTreePokemonSubsetNameType } from '../subset/BattleTreePokemonSubset';
import SeededRand from '../../utilities/SeededRand';
import { subsets } from '../BattleTree.config';
import { PokemonNameType } from '../../pokemons/PokemonNameType';
import Rand from '../../utilities/Rand';
import { BattleTreePokemon } from '../BattleTreePokemon';
import { pokemonMap } from '../../pokemons/PokemonList';
import Requirement from '../../requirements/Requirement';
import { BattleTreeLevelRequirement } from '../requirements/BattleTreeRequirements';

export class BattleTreeUtil {
    public static calculateSeed(): number {
        const now = new Date();
        // return Number((now.getFullYear() - 1900) * now.getDate() + 1000 * now.getMonth() + 100000 * now.getDate());
        return Number((now.getFullYear() - 1900) * now.getDate() + 1000 * now.getMonth() + 100000 * now.getDate() * now.getHours() * (Math.floor(now.getMinutes() / 15) + 1));
    }

    public static getRandomSubset({ seed, otherSubset = undefined } : { seed: number, otherSubset?: BattleTreePokemonSubsetNameType }): BattleTreePokemonSubset {
        SeededRand.seed(seed);
        return SeededRand.fromWeightedArray(Object.values(subsets), Object.values(subsets).map(subset => otherSubset ? subset.getCustomSubsetWeight(otherSubset) : subset.weight));
    }

    public static getRandomTeamFromSubset({ subset, seed, stage = 0, amount = 3 }: { subset: BattleTreePokemonSubsetNameType, seed: number, stage?: number, amount?: number }): PokemonNameType[] {
        SeededRand.seed(seed);
        const uniqueIds = [...new Set(subsets[subset].subset.map(p => Math.floor(p.id)))];

        SeededRand.seed(seed + stage);
        const shuffledUniqueIds = SeededRand.shuffleArray(uniqueIds);
        return shuffledUniqueIds.slice(0, amount).map(id => SeededRand.fromArray(subsets[subset].subset.filter(p => Math.floor(p.id) === id)).name);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static calculatePokemonLevelForPlayer(pokemon: PokemonNameType): number {
        // TODO : BT : Calculate proper level for the player's pokemon
        return App.game.battleTree.level;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static calculatePokemonLevelForOpponent(pokemon: PokemonNameType, stage: number): number {
        // TODO : BT : Calculate proper level for the opponent's pokemon
        return stage;
    }

    public static calculateAttackSpeed(): number {
        return 1;
    }

    public static calculateBattleTreeExperienceForPokemonDefeat(pokemon: BattleTreePokemon): number {
        // TODO : BT : Correct EXP scaling
        const b = pokemonMap[pokemon.name]?.exp ?? 0;
        const l = pokemon.level;
        const lp = App.game.battleTree.level;
        const e = false ? 1.5 : 1;
        const s = 1;
        const t = 1;
        const v = 1;
        const f = 1;
        const p = 1;

        const expGen7 = Math.min(((b * l / 5) * (1 / s) * Math.pow(((2 * l + 10) / (l + lp + 10)), 2.5) + 1) * t * e * v * f * p, b * 10);

        return Math.floor(expGen7);
    }

    public static calculateRewardMultiplier(): number {
        return App.game.battleTree.sequence.modifierManager.getValue({ key: 'rewards', base: 1 });
    }

    private static tryAddPokemonToTeamA(name: PokemonNameType): void {
        if (!App.game.party.alreadyCaughtPokemonByName(name))
            return;

        if (!App.game.battleTree.sequence.candidates().includes(name)) {
            return;
        }

        if (App.game.battleTree.sequence.teams.Team_A.hasPokemon(name)) {
            App.game.battleTree.sequence.teams.Team_A.removePokemon(name);
        } else {
            App.game.battleTree.sequence.teams.Team_A.addPokemon(name, BattleTreeUtil.calculatePokemonLevelForPlayer(name));
        }
    }

    public static clickCandidate(name: PokemonNameType): void {
        this.tryAddPokemonToTeamA(name);
    }

    public static clickRandomTeam(): void {
        App.game.battleTree.sequence.teams.Team_A.removeAllPokemon();
        Rand.shuffleArray(App.game.battleTree.sequence.candidates().filter(name => App.game.party.alreadyCaughtPokemonByName(name)))
            .slice(0, App.game.battleTree.sequence.teams.Team_A.maxTeamSize)
            .forEach(name => App.game.battleTree.sequence.teams.Team_A.addPokemon(name, BattleTreeUtil.calculatePokemonLevelForPlayer(name)));
    }

    public static clickLoadPreviousTeam(): void {
        App.game.battleTree.sequence.teams.Team_A.removeAllPokemon();
        App.game.battleTree.previousTeam.forEach(p => this.tryAddPokemonToTeamA(p));
    }

    public static isBTLevelRequirement(req: Requirement): req is BattleTreeLevelRequirement {
        return req instanceof BattleTreeLevelRequirement;
    }

    public static isCompositeRequirement(req: Requirement): req is Requirement & { requirements: Requirement[] } {
        return Array.isArray((req as any)?.requirements);
    }


    public static collectLevelRequirements(req: Requirement): BattleTreeLevelRequirement[] {
        const result: BattleTreeLevelRequirement[] = [];
        const stack: Requirement[] = [req];

        while (stack.length) {
            const current = stack.pop();
            if (this.isBTLevelRequirement(current)) {
                result.push(current);
            }
            if (this.isCompositeRequirement(current)) {
                stack.push(...current.requirements);
            }
        }
        return result;
    }

    public static getRequiredLevel(req: Requirement, strategy: 'min' | 'max' | 'first' = 'min'): number | undefined {
        const levels = this.collectLevelRequirements(req).map(r => r.requiredValue);

        if (!levels.length) return undefined;

        switch (strategy) {
            case 'first': return levels[0];
            case 'max': return Math.max(...levels);
            case 'min':
            default:
                return Math.min(...levels);
        }
    }

    public static sortByRequiredLevel<T extends Requirement>(reqs: T[], strategy: 'min' | 'max' | 'first' = 'min'): T[] {
        return [...reqs].sort((a, b) => {
            const av = this.getRequiredLevel(a, strategy);
            const bv = this.getRequiredLevel(b, strategy);

            const aVal = av ?? Number.POSITIVE_INFINITY;
            const bVal = bv ?? Number.POSITIVE_INFINITY;

            return aVal - bVal;
        });
    }

    public static sortProgressionLevelInfo(info: { description: string, requirement: Requirement }[]): {
        description: string,
        requirement: Requirement,
        level: number,
    }[] {
        const result = [...info].sort((a, b) => {
            const aVal = this.getRequiredLevel(a.requirement, 'min') ?? Number.POSITIVE_INFINITY;
            const bVal = this.getRequiredLevel(b.requirement, 'min') ?? Number.POSITIVE_INFINITY;

            return aVal - bVal;
        });

        return result.map(value => ({
            ...value,
            level: this.getRequiredLevel(value.requirement, 'min'),
        }));
    }
}
