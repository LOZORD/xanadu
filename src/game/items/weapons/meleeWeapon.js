import Weapon from './weapon';

export default class MeleeWeapon extends Weapon {
  constructor(kwargs = {}) {
    super(kwargs);
    this.mineRate = 10; // how many turns it takes to mine a wall
  }
}
