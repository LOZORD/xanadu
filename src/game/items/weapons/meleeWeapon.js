import Weapon from './weapon';

export default class MeleeWeapon extends Weapon {
  constructor(...args) {
    super(...args);
    this.mineRate = 10; // how many turns it takes to mine a wall
  }
}
