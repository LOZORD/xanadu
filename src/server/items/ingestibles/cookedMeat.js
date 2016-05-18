import Food from './food';

export default class CookedMeat extends Food {
  constructor(kwargs = {}) {
    super(kwargs);

    this.stats.health       = +20;
    this.stats.strength     = +20;
    this.stats.intelligence = +20;
  }
}
