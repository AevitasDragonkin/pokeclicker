import { BattleTreeModifierContext } from './BattleTreeModifierContext';
import {
    BATTLE_TREE_MODIFIER_DEFAULT_WEIGHT,
    BattleTreeModifierDefinition,
    BattleTreeModifiers, BattleTreeModifierSource, TickData,
} from './BattleTreeModifiers';
import { ObservableArray, PureComputed } from 'knockout';
import SeededRand from '../../utilities/SeededRand';
import { TeamType } from '../BattleTreeSequence';
import { BattleTreeEffect, BattleTreeEffectKey, BattleTreeEffectRuntimeContext, BattleTreeEffectValue } from './BattleTreeEffect';
import GameHelper from '../../GameHelper';
import { BattleTreeModifierNameType } from './BattleTreeModifierNameType';
import { BattleTreePokemon } from '../BattleTreePokemon';

type Active<Data> = {
    definition: BattleTreeModifierDefinition<Data>;
    data: Data;
};

type IndexStamp<Data> = { active: Active<Data>; effect: BattleTreeEffect<Data>; };

export interface ValueQuery extends BattleTreeEffectRuntimeContext {
    key: BattleTreeEffectKey;
    scope?: TeamType;
    base?: number;
}

export interface BattleTreeModifierManagerSaveData {
    entries: {
        id: BattleTreeModifierNameType,
        data?: unknown,
        source?: BattleTreeModifierSource,
        disabled?: boolean,
    }[]
}

export interface BattleTreeModifierHistoryEntry<Data> {
    definition: BattleTreeModifierDefinition,
    data: Data,
    source: BattleTreeModifierSource,
    disabled?: boolean,
}

export class BattleTreeModifierManager {
    private _ctx: BattleTreeModifierContext;

    private _history: ObservableArray<BattleTreeModifierHistoryEntry<any>>;

    public candidates: PureComputed<BattleTreeModifierNameType[]> = ko.pureComputed(() => {
        const allOffers = BattleTreeModifiers
            .filter(value => {
                // Abort when the weight is 0 or less
                if ((value.weight ?? BATTLE_TREE_MODIFIER_DEFAULT_WEIGHT) <= 0)
                    return false;

                // Abort when the MAX STACKS has been reached
                if (this._history().filter(h => h.definition.id === value.id).length >= (value.stack?.max ?? Infinity))
                    return false;

                // Abort when canOffer exists and the result is false
                if (value.canOffer && !value.canOffer(this._ctx))
                    return false;

                // Abort when a requirement exists and it's not completed yet
                if (!(value.requirement?.isCompleted() ?? true))
                    return false;

                return true;
            });

        const playerAddedModifiers = this.history.filter(v => v.source === 'player');
        const lastPlayerAddedModifier = playerAddedModifiers.length > 0 ? GameHelper.hash(playerAddedModifiers.at(-1).definition.id) : 0;

        SeededRand.seed(this._ctx.sequence.seed + this._ctx.sequence.stage + lastPlayerAddedModifier);
        return SeededRand
            .shuffleWeightedArray(allOffers, allOffers.map(value => value.weight ?? BATTLE_TREE_MODIFIER_DEFAULT_WEIGHT))
            .slice(0, this.getValue({ key: 'modifier_count', base: 3 }))
            .map(value => value.id);
    });

    constructor(ctx: BattleTreeModifierContext) {
        this._ctx = ctx;
        this._history = ko.observableArray();
    }

    public update(tickData: TickData) {
        this._history().forEach(entry => {
            if (entry.disabled) return;

            if (entry.definition.stateScope?.includes(this._ctx.sequence.state)) {
                entry.definition.onTick?.(this._ctx, { definitionData: entry.data, tickData });
            }
        });
    }

    public onStageStart(): void {
        this._history().forEach(entry => {
            if (entry.disabled) return;

            entry.definition.onStageStart?.(this._ctx, { definitionData: entry.data });
        });
    }

    public onStageCleared(): void {
        this._history().forEach(entry => {
            if (entry.disabled) return;

            entry.definition.onStageCleared?.(this._ctx, { definitionData: entry.data });
        });
    }

    public onPokemonFaint(pokemon: BattleTreePokemon): void {
        this._history().forEach(entry => {
            if (entry.disabled) return;

            entry.definition.onPokemonFaint?.(this._ctx, { definitionData: entry.data, pokemon: pokemon });
        });
    }

    public addPlayerModifier(id: BattleTreeModifierNameType) {
        if (!this.candidates().includes(id)) return;

        this.addModifier(id, 'player');
    }

    public addSystemModifier(id: BattleTreeModifierNameType) {
        this.addModifier(id, 'system');
    }

    private addModifier(id: BattleTreeModifierNameType, source: BattleTreeModifierSource) {
        const definition = BattleTreeModifiers.find(mod => mod.id === id);

        if (!definition) return;

        const data = definition.createData ? definition.createData(this._ctx) : (undefined as unknown);

        definition.onAcquire?.(this._ctx, { definitionData: data });
        this._history().forEach(entry => {
            if (entry.disabled) return;

            entry.definition.onAnyModifierAdded?.(this._ctx, id, source);
        });

        this._history.push({ definition, data, source });
    }

    public disableModifierByIndex(index: number) {
        const entry = this._history()[index];
        if (!entry) return;

        entry.disabled = true;
    }

    public getModifierById(id: BattleTreeModifierNameType): BattleTreeModifierDefinition | undefined {
        return BattleTreeModifiers.find(mod => mod.id === id);
    }

    private *iterMatching(query: ValueQuery): Iterable<IndexStamp<any>> {
        for (const historyEntry of this._history()) {
            const { definition, disabled } = historyEntry;

            if (disabled) continue;
            if (!definition.effects) continue;

            for (const effect of definition.effects) {
                if (effect.target.key !== query.key) continue;
                if (query.scope && !effect.target.scope?.includes(query.scope)) continue;

                yield { active: historyEntry, effect };
            }
        }
    }

    public getValue(query: ValueQuery): number {
        const effects = Array.from(this.iterMatching(query));
        const base = query.base ?? 1;

        const resolve = <D>(val: BattleTreeEffectValue<D>, data: D, runtimeContext: BattleTreeEffectRuntimeContext) => typeof val === 'function'
            ? (val as ((ctx: BattleTreeModifierContext, data: D, runtimeContext: BattleTreeEffectRuntimeContext) => number))(this._ctx, data, runtimeContext)
            : val;

        let returnValue = base;

        effects.every(entry => {
            const v = resolve(entry.effect.value, entry.active.data, query);

            switch (entry.effect.operation) {
                case 'multiplicative': {
                    if (v === 0)
                        returnValue = 0;
                    else
                        returnValue *= v;
                    return true;
                }
                case 'additive': returnValue += v; return true;
                case 'reset': returnValue = base; return true;
                case 'override': returnValue = v; return true;
                case 'final': returnValue = v; return false;
            }
        });

        return returnValue;
    }

    get history(): BattleTreeModifierHistoryEntry<unknown>[] {
        return this._history();
    }

    public resolveModifierDescription(id: BattleTreeModifierNameType, { data, create }: { data?: any, create?: boolean } = {}) {
        const modifier: BattleTreeModifierDefinition = this.getModifierById(id);

        if (!modifier) return 'Modifier not found';

        let description: string = modifier.description;

        if (modifier.dataDescription) {
            if (data) {
                description += ' ' + modifier.dataDescription(this._ctx, data);
            } else if (create) {
                description += ' ' + modifier.dataDescription(this._ctx, modifier.createData?.(this._ctx));
            }
        }

        return description;
    }

    public toJSON(): BattleTreeModifierManagerSaveData {
        return {
            entries: this._history().map(entry => {
                return entry.data === undefined ? { id: entry.definition.id, ...(entry.source !== 'player' ? { source: entry.source } : { }), ...(entry.disabled ? { disabled: entry.disabled } : { }) } : { id: entry.definition.id, data: entry.data, ...(entry.source !== 'player' ? { source: entry.source } : { }), ...(entry.disabled ? { disabled: entry.disabled } : { }) };
            }),
        };
    }

    public fromJSON(json: BattleTreeModifierManagerSaveData): void {
        this._history.removeAll();

        json.entries.forEach(entry => {
            const definition = BattleTreeModifiers.find(mod => mod.id === entry.id);

            if (!definition) return;

            this._history.push({
                definition,
                data: entry.data,
                source: entry.source ?? 'player',
                ...(entry.disabled ? { disabled: true } : {}),
            });
        });
    }
}
