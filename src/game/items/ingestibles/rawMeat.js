import Food from './food';

export default class RawMeat extends Food {
  constructor(kwargs = {}) {
    super(kwargs);

    this.stats.health   = +10;
    this.stats.strength = +10;
  }
}
