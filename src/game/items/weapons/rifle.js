import Gun from './gun';
import RifleBullet from './rifleBullet';

export default class Rifle extends Gun {
  constructor(kwargs = {}) {
    super(kwargs);
    this.currentClipAmount  = 10;
    this.totalClipAmount    = 10;
    this.bulletDistance     = 3;
    this.bulletConstructor  = RifleBullet;
  }
}
