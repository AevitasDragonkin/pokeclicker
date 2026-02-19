import { BattleTreeModifierContext } from './BattleTreeModifierContext';
import {
    BATTLE_TREE_MODIFIER_DEFAULT_WEIGHT,
    BattleTreeModifierDefinition,
    BattleTreeModifierDescription, BattleTreeModifierNameType, BattleTreeModifiers, BattleTreeModifierSource, TickData,
} from './BattleTreeModifiers';
import { ObservableArray, PureComputed } from 'knockout';
import SeededRand from '../../utilities/SeededRand';
import { TeamType } from '../BattleTreeSequence';
import { BattleTreeEffect, BattleTreeEffectKey, BattleTreeEffectValue } from './BattleTreeEffect';
import GameHelper from '../../GameHelper';

type Active<Data> = {
    definition: BattleTreeModifierDefinition<Data>;
    data: Data;
};

type IndexStamp<Data> = { active: Active<Data>; effect: BattleTreeEffect<Data>; };

export interface ValueQuery {
    key: BattleTreeEffectKey;
    scope?: TeamType;
    base?: number;
}

export interface BattleTreeModifierManagerSaveData {
    entries: {
        id: BattleTreeModifierNameType,
        data?: unknown,
        source?: BattleTreeModifierSource,
    }[]
}

export interface BattleTreeModifierHistoryEntry<Data> {
    definition: BattleTreeModifierDefinition,
    data: Data,
    source: BattleTreeModifierSource,
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
        const lastPlayerAddedModifier = playerAddedModifiers.length > 0 ? GameHelper.hash(playerAddedModifiers.at(-1).source) : 0;

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
            if (entry.definition.stateScope?.includes(this._ctx.sequence.state)) {
                entry.definition.onTick?.(this._ctx, { definitionData: entry.data, tickData });
            }
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
        this._history.push({ definition, data, source });

        definition.onAcquire?.(this._ctx);
    }

    public getModifierById(id: BattleTreeModifierNameType): BattleTreeModifierDefinition | undefined {
        return BattleTreeModifiers.find(mod => mod.id === id);
    }

    private *iterMatching(query: ValueQuery): Iterable<IndexStamp<any>> {
        for (const historyEntry of this._history()) {
            const { definition } = historyEntry;

            if (!definition.effects) continue;

            for (const effect of definition.effects) {
                if (effect.target.key !== query.key) continue;
                if (query.scope && effect.target.scope.includes(query.scope)) continue;

                yield { active: historyEntry, effect };
            }
        }
    }

    public getValue(query: ValueQuery): number {
        const effects = Array.from(this.iterMatching(query));
        const base = query.base ?? 1;

        const resolve = <D>(val: BattleTreeEffectValue<D>, data: D) => typeof val === 'function' ? (val as ((ctx: BattleTreeModifierContext, data: D) => number))(this._ctx, data) : val;

        let returnValue = base;

        effects.every(entry => {
            const v = resolve(entry.effect.value, entry.active.data);

            switch (entry.effect.operation) {
                case 'multiplicative': returnValue *= v; return true;
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

    public resolveModifierDescription(id: BattleTreeModifierNameType, d?: any) {
        const modifier: BattleTreeModifierDefinition = this.getModifierById(id);

        if (!modifier) return 'Modifier not found';

        const resolve = <D>(des: BattleTreeModifierDescription<D>, data: D) => typeof des === 'function' ? (des as ((ctx: BattleTreeModifierContext, data: D) => string))(this._ctx, data) : des;
        return resolve(modifier.description, d ?? modifier.createData?.(this._ctx));
    }

    public toJSON(): BattleTreeModifierManagerSaveData {
        return {
            entries: this._history().map(entry => {
                return entry.data === undefined ? { id: entry.definition.id, ...(entry.source !== 'player' ? { source: entry.source } : { }) } : { id: entry.definition.id, data: entry.data, ...(entry.source !== 'player' ? { source: entry.source } : { }) };
            }),
        };
    }

    public fromJSON(json: BattleTreeModifierManagerSaveData): void {
        this._history.removeAll();

        json.entries.forEach(entry => {
            const definition = BattleTreeModifiers.find(mod => mod.id === entry.id);

            if (!definition) return;

            this._history.push({ definition, data: entry.data, source: entry.source ?? 'player' });
        });
    }
}
