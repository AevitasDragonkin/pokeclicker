import { Feature } from '../DataStore/common/Feature';
import { BATTLE_TREE_MAX_LEVEL, GameState } from '../GameConstants';
import { Observable, ObservableArray, PureComputed } from 'knockout';
import Notifier from '../notifications/Notifier';
import NotificationConstants from '../notifications/NotificationConstants';
import { BattleTreeSequence } from './BattleTreeSequence';
import { BattleTreeUtil } from './util/BattleTreeUtil';
import { BattleTreeRewardManager } from './rewards/BattleTreeRewardManager';
import { PokemonNameType } from '../pokemons/PokemonNameType';
import { BattleTreeSequenceState } from './types';

export type BattleTreeRecurrence = 'once' | 'per_seed' | 'per_sequence';

export class BattleTree implements Feature {
    name: string = 'BattleTree';
    saveKey: string = 'battleTree';
    defaults: Record<string, any> = { };

    private _experience: Observable<number> = ko.observable(0);
    private _level: PureComputed<number> = ko.pureComputed(() => BattleTree.convertExperienceToLevel(this._experience()));
    private _progressToNextLevel: PureComputed<number> = ko.pureComputed(() => {
        if (this._level() >= BATTLE_TREE_MAX_LEVEL) {
            return 1;
        }

        return (this._experience() - BattleTree.convertLevelToExperience(this._level())) /
            (BattleTree.convertLevelToExperience(this._level() + 1) - BattleTree.convertLevelToExperience(this._level()));
    });

    private _rewardManager = new BattleTreeRewardManager();
    private _sequence: Observable<BattleTreeSequence> = ko.observable(new BattleTreeSequence());

    public static autoPickModifiers: Observable<boolean> = ko.observable(false);
    private _previousTeam: ObservableArray<PokemonNameType> = ko.observableArray();

    canAccess(): boolean {
        return true;
    }

    initialize(): void {
    }

    update(delta: number) {
        this.checkNewSequenceAvailable();

        if (App.game.gameState === GameState.battleTree) {
            this.sequence?.update(delta);
        }
    }

    public checkNewSequenceAvailable(): void {
        if (this.sequence.state === BattleTreeSequenceState.PREPARATION && this.sequence.seed !== BattleTreeUtil.calculateSeed()) {
            this.startNewSequence();
        }
    }

    public startNewSequence(): void {
        this._previousTeam.removeAll();
        this._previousTeam.push(...this.sequence.teams.Team_A.list.map(p => p.name));
        this._sequence(new BattleTreeSequence());
    }

    public enter(): void {
        App.game.gameState = GameState.battleTree;
    }

    public leave(): void {
        App.game.gameState = GameState.town;
    }

    public addExp(amount: number): void {
        const currentLevel = this._level();
        this._experience(this._experience() + amount);

        if (this._level() > currentLevel) {
            Notifier.notify({
                message: `Your Battle Tree level has increased ${currentLevel} > ${this._level()}`,
                type: NotificationConstants.NotificationOption.success,
                timeout: 1e4,
            });
        }
    }

    get experience(): number {
        return this._experience();
    }

    get level(): number {
        return this._level();
    }

    get progressToNextLevel(): number {
        return this._progressToNextLevel();
    }

    get previousTeam(): PokemonNameType[] {
        return this._previousTeam();
    }

    get sequence(): BattleTreeSequence {
        return this._sequence();
    }

    get rewardManager(): BattleTreeRewardManager {
        return this._rewardManager;
    }

    toJSON(): Record<string, any> {
        return {
            exp: this._experience(),
            sequence: this._sequence()?.toJSON(),
            rewardManager: this._rewardManager.toJSON(),
        };
    }

    fromJSON(json: Record<string, any>): void {
        this._experience(json.exp ?? 0);
        this._rewardManager.fromJSON(json.rewardManager);

        if (json.sequence) {
            this._sequence(BattleTreeSequence.fromJSON(json.sequence));
        }
    }

    public static convertLevelToExperience(level: number): number {
        return level <= 1 ? 0 : Math.floor(5 * Math.pow(level, 3) / 4);
    }

    public static convertExperienceToLevel(experience: number): number {
        let level = 0;
        while (experience >= this.convertLevelToExperience(level + 1)) {
            ++level;
        }
        return Math.min(Math.max(level, 1), BATTLE_TREE_MAX_LEVEL);
    }
}
