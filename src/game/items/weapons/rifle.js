import Gun from './gun';
import { RifleBullet } from './bullet';

export default class Rifle extends Gun {
  constructor(...args) {
    super(...args);
    this.currentClipAmount  = 10;
    this.totalClipAmount    = 10;
    this.bulletDistance     = 3;
    this.bulletConstructor  = RifleBullet;
  }
}
