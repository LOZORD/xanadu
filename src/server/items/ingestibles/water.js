import Liquid from './liquid';

export default class Water extends Liquid {
  constructor(kwargs = {}) {
    super(kwargs);

    this.stats.strength = +10;
    this.stats.agility  = +10;
  }
}
