import Item from './Item';
import PokemonType from '../enums/PokemonType';

export default class GemItem extends Item {
    private _type: PokemonType;

    constructor(type: PokemonType) {
        super(PokemonType[type], undefined, undefined, undefined, `${PokemonType[type]} Gem`);

        this._type = type;
    }

    gain(n: number) {
        App.game.gems.gainGems(n, this._type);
    }

    get image() {
        return `assets/images/gems/${PokemonType[this._type]} Gem.png`;
    }
}
