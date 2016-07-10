import Entity from './entity';
export default class MoveableEntity extends Entity {
  constructor(row = 0, col = 0) {
    super(row, col);
  }
  moveUp() {
    this.row -= 1;
  }
  moveDown() {
    this.row += 1;
  }
  moveLeft() {
    this.col -= 1;
  }
  moveRight() {
    this.col += 1;
  }
}
