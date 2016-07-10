import Ingestible from './ingestible';

export default class Food extends Ingestible {
  constructor(kwargs = {}) {
    super(kwargs);
  }
}

export class RawMeat extends Food {
  constructor(kwargs = {}) {
    super(kwargs);

    this.stats.health   = +10;
    this.stats.strength = +10;
  }
}

export class CookedMeat extends Food {
  constructor(kwargs = {}) {
    super(kwargs);

    this.stats.health       = +20;
    this.stats.strength     = +20;
    this.stats.intelligence = +20;
  }
}

export class Stew extends Food {
  constructor(kwargs = {}) {
    super(kwargs);

    this.stats = {
      health: 50,
      strength: 50,
      intelligence: 50,
      agility: 50
    };
  }
}