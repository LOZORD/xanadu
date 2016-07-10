import Gun from './gun';
import { RevolverBullet } from './bullet';

export default class Revolver extends Gun {
  constructor(...args) {
    super(...args);
    this.currentClipAmount = 6;
    this.totalClipAmount = 6;
    this.bulletDistance = 1;
    this.bulletConstructor = RevolverBullet;
  }
}
