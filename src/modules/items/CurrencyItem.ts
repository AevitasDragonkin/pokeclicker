import Item from './Item';
import { Currency } from '../GameConstants';
import { ItemNameType } from './ItemNameType';
import Amount from '../wallet/Amount';

export class CurrencyItem extends Item {
    private readonly _currency: Currency;

    constructor(name: ItemNameType, currency: Currency, displayName: string, description: string) {
        super(name, 0, undefined, undefined, displayName, description);

        this._currency = currency;
    }

    gain(n: number) {
        App.game.wallet.addAmount(new Amount(n, this._currency), true);
    }

    get image() {
        return `assets/images/currency/${Currency[this._currency]}.svg`;
    }
}
