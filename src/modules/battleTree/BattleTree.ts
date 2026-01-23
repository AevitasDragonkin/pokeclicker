import { Feature } from '../DataStore/common/Feature';
import { BATTLE_TREE_MAX_LEVEL, GameState } from '../GameConstants';
import { Observable, PureComputed } from 'knockout';
import Notifier from '../notifications/Notifier';
import NotificationConstants from '../notifications/NotificationConstants';
import { BattleTreeSequence, BattleTreeSequenceState } from './BattleTreeSequence';
import { BattleTreeUtil } from './util/BattleTreeUtil';

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

    private _sequence: Observable<BattleTreeSequence> = ko.observable(new BattleTreeSequence());

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

    get sequence(): BattleTreeSequence {
        return this._sequence();
    }

    toJSON(): Record<string, any> {
        return {
            exp: this._experience(),
            sequence: this._sequence()?.toJSON(),
        };
    }

    fromJSON(json: Record<string, any>): void {
        this._experience(json.exp ?? 0);

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
