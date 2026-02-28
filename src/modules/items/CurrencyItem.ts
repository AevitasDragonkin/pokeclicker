import Item from './Item';
import { camelCaseToString, Currency } from '../GameConstants';
import Amount from '../wallet/Amount';

export default class CurrencyItem extends Item {
    private _currency: Currency;

    constructor(currency: Currency) {
        super(Currency[currency], 0, undefined, undefined, camelCaseToString(Currency[currency]), '');

        this._currency = currency;
    }

    gain(n: number) {
        App.game.wallet.addAmount(new Amount(n, this._currency), true);
    }

    get image() {
        return `assets/images/currency/${Currency[this._currency]}.svg`;
    }
}
