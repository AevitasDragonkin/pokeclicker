import GameHelper from '../../GameHelper';
import UndergroundToolType from './UndergroundToolType';
import { Coordinate } from '../mine/Mine';
import Notifier from '../../notifications/Notifier';
import NotificationConstants from '../../notifications/NotificationConstants';
import { Observable, PureComputed } from 'knockout';

type UndergroundToolProperties = {
    id: UndergroundToolType;
    displayName: string;
    description: string;

    durabilityPerUse: number;
    maximumChargesPerMine: number;

    customRestoreRateFn?: (tool: UndergroundTool, level: number) => number;
    action: (x: number, y: number) => { coordinatesMined: Array<Coordinate>, success: boolean };
};

export default class UndergroundTool {
    private _toolProperties: UndergroundToolProperties;

    private _durability: Observable<number> = ko.observable(1).extend({ numeric: 5 });
    private _charges: Observable<number> = ko.observable(0).extend({ numeric: 0 });

    public canUseTool: PureComputed<boolean> = ko.pureComputed(() => this.durability >= this.durabilityPerUse && this.charges > 0);
    public restoreRatePerSecond: PureComputed<number> = ko.pureComputed(() => this.calculateDurabilityRestoreRatePerSecond(App.game.underground.undergroundLevel));

    constructor(toolProperties: UndergroundToolProperties) {
        this._toolProperties = toolProperties;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public tick(deltaTime: number) {
        this.handleDurabilityTick(deltaTime);
    }

    private handleDurabilityTick(deltaTime: number) {
        if (this.durability >= 1) return;

        const restorePercentage: number = this.restoreRatePerSecond() * deltaTime;

        if (restorePercentage >= 1) {
            this._durability(1);
            return;
        }

        this._durability(Math.min(this.durability + restorePercentage, 1));

        if (this.durability === 1) {
            Notifier.notify({
                title: 'Underground tools',
                message: `${this.displayName} reached 100% durability!`,
                type: NotificationConstants.NotificationOption.success,
                timeout: 1e4,
                sound: NotificationConstants.NotificationSound.General.underground_energy_full,
                setting: NotificationConstants.NotificationSetting.Underground.underground_energy_full,
            });
        }
    }

    public reduceDurabilityByUse() {
        GameHelper.incrementObservable(this._charges, -1);
        GameHelper.incrementObservable(this._durability, -this.durabilityPerUse);
    }

    public resetCharges() {
        this._charges(Math.max(this.charges, this._toolProperties.maximumChargesPerMine));
    }

    get id(): UndergroundToolType {
        return this._toolProperties.id;
    }

    get displayName(): string {
        return this._toolProperties.displayName;
    }

    get description(): string {
        return this._toolProperties.description;
    }

    get durabilityPerUse(): number {
        return this._toolProperties.durabilityPerUse;
    }

    get durability(): number {
        return this._durability();
    }

    get maximumChargesPerMine(): number {
        return this._toolProperties.maximumChargesPerMine;
    }

    get charges(): number {
        return this._charges();
    }

    get action() {
        return this._toolProperties.action;
    }

    public fromJSON(save) {
        this._durability(save?.durability ?? 1);
        this._charges(save?.charges || this._toolProperties.maximumChargesPerMine);
    }

    public toJSON() {
        return {
            durability: this._durability(),
            charges: this._charges(),
        };
    }

    public calculateDurabilityRestoreRatePerSecond(level: number = 0): number {
        if (this._toolProperties.customRestoreRateFn) {
            return this._toolProperties.customRestoreRateFn(this, level);
        }

        const [minimumLevel, maximumLevel] = [0, 20];
        const deltaLevel: number = maximumLevel - minimumLevel;

        const baseRatePerSecond = 0.001;
        const finalRatePerSecond = 0.18;

        return (2 ** (Math.max(level - minimumLevel, 0) / deltaLevel) ** 10 - 1) * (finalRatePerSecond - baseRatePerSecond) + baseRatePerSecond;
    }
}
