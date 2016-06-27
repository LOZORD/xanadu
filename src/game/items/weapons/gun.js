import Weapon from './weapon';

export default class Gun extends Weapon {
  constructor(kwargs = {}) {
    super(kwargs);
    this.currentClipAmount  = 0; // how many bullets are currently loaded 
    this.totalClipAmount    = 0; // how many bullets can be loaded at a time
    this.bulletDistance     = 0; // a number 1 - 3 (how many rooms away)
    this.bulletConstructor  = null; // a pointer to the bullet type
    // integer percentage coefficient of how accurate this gun will be
    // when firing, given the wielder's agility and strength and the gun's
    // current condition/quality, as well as the distance to the target
    this.accuracy           = 100; // TODO: implement that function!
  }
  canShoot(distance) {
    return distance <= this.bulletDistance;
  }
}
