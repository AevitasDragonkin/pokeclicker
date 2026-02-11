import { BattleTreeModifierContext } from './BattleTreeModifierContext';
import {
    BattleTreeModifierDefinition, BattleTreeModifierNameType, BattleTreeModifiers, TickData,
} from './BattleTreeModifiers';
import { ObservableArray, PureComputed } from 'knockout';
import SeededRand from '../../utilities/SeededRand';
import { TeamType } from '../BattleTreeSequence';
import { BattleTreeEffect, BattleTreeEffectKey, BattleTreeEffectValue } from './BattleTreeEffect';


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
    }[]
}

export interface BattleTreeModifierHistoryEntry<Data> {
    definition: BattleTreeModifierDefinition,
    data: Data,
}

export class BattleTreeModifierManager {
    private _ctx: BattleTreeModifierContext;

    private _history: ObservableArray<BattleTreeModifierHistoryEntry<any>>;

    public candidates: PureComputed<BattleTreeModifierNameType[]> = ko.pureComputed(() => {
        const allOffers = BattleTreeModifiers.filter(value => value.canOffer ? value.canOffer(this._ctx) : true);

        SeededRand.seed(this._ctx.sequence.seed + this._ctx.sequence.stage);
        return SeededRand
            .shuffleWeightedArray(allOffers, allOffers.map(value => value.weight ?? 1))
            .slice(0, 3)
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

        this.addModifier(id);
    }

    public addSystemModifier(id: BattleTreeModifierNameType) {
        this.addModifier(id);
    }

    private addModifier(id: BattleTreeModifierNameType) {
        const definition = BattleTreeModifiers.find(mod => mod.id === id);

        if (!definition) return;

        const data = definition.createData ? definition.createData(this._ctx) : (undefined as unknown);
        this._history.push({ definition, data });

        definition.onAcquire?.(this._ctx);
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

    public toJSON(): BattleTreeModifierManagerSaveData {
        return {
            entries: this._history().map(entry => {
                const payload = entry.definition.toJSON ? entry.definition.toJSON(entry.data) : entry.data;
                return payload === undefined ? { id: entry.definition.id } : { id: entry.definition.id, data: payload };
            }),
        };
    }

    public fromJSON(json: BattleTreeModifierManagerSaveData): void {
        this._history.removeAll();

        json.entries.forEach(entry => {
            const definition = BattleTreeModifiers.find(mod => mod.id === entry.id);

            if (!definition) return;

            this._history.push({ definition, data: definition.fromJSON ? definition.fromJSON(entry.data) : undefined });
        });
    }
}
