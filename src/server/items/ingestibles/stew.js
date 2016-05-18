import Food from './food';

export default class Stew extends Food {
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
