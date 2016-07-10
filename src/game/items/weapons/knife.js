import MeleeWeapon from './meleeWeapon';

export default class Knife extends MeleeWeapon {
  constructor(...args) {
    super(...args);
    this.mineRate = 8;
  }
}
