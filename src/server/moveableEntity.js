import Entity from './entity';
export default class MoveableEntity extends Entity {
  constructor(args = {}) {
    super(args);
  }
  moveUp() {
    this.y -= 1;
  }
  moveDown() {
    this.y += 1;
  }
  moveLeft() {
    this.x -= 1;
  }
  moveRight() {
    this.x += 1;
  }
}
