import Ingestible from './ingestible';

export default class Food extends Ingestible {}

export class Meat extends Food {}

export class RawMeat extends Meat {
  constructor(kwargs = {}) {
    super(kwargs);

    this.stats.health   = +10;
    this.stats.strength = +10;
  }
}

export class CookedMeat extends Meat {
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

export class Honeydew extends Food {
  constructor(kwargs = {}) {
    super(kwargs);

    this.stats = {
      health: 50,
      strength: 50,
      intelligence: 50,
      agility: 50
    };

    this.givesImmortality = true;
  }
}

export class Plant extends Food {}

export class CaveLeaf extends Plant {
  constructor(kwargs = {}) {
    super(kwargs);

    this.addictionRelief = 5;
  }
}

export class Nightshade extends Plant {
  constructor(kwargs = {}) {
    super(kwargs);

    this.isPoisoned = true;
    this.addictionRelief = 5;
  }
}

export class DarkPoppy extends Plant {
  constructor(kwargs = {}) {
    super(kwargs);

    this.addictionRelief = 10;
    this.isAddictive = true;
  }
}