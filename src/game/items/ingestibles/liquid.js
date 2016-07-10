import Ingestible from './ingestible';

export default class Liquid extends Ingestible {
  constructor(kwargs = {}) {
    super(kwargs);
  }
}

export class Water extends Liquid {
  constructor(kwargs = {}) {
    super(kwargs);

    this.stats.strength = +10;
    this.stats.agility  = +10;
  }
}

export class AlphWater extends Water {
  constructor(kwargs = {}) {
    super(kwargs);

    this.givesImmortality = true;
  }
}