import Gun from './gun';

// TODO
const RevolverBullet = {};

export default class Revolver extends Gun {
  constructor(kwargs = {}) {
    super(kwargs);
    this.currentClipAmount = 6;
    this.totalClipAmount = 6;
    this.bulletDistance = 1;
    this.bulletConstructor = RevolverBullet;
  }
}
