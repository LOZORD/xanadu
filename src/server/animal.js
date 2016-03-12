class Animal extends Entity {
  constructor(args = {}) {
    super(args);
    this.health       = args.health       || 100;
    this.strength     = args.strength     || 100;
    this.intelligence = args.intelligence || 100;
    this.inventory    = args.inventory    || {};
  }
  update(args) {
    this.health       = args.healthF(this)        || this.health;
    this.strength     = args.strengthF(this)      || this.strength;
    this.intelligence = args.intelligenceF(this)  || this.intelligence;
  }
  isAlive() {
    return this.health > 0;
  }
}
