export default class Entity {
  // origin (0,0) is at NW corner of the map
  constructor(args = {}) {
    this.x = args.x || 0;
    this.y = args.y || 0;
  }
  setPos(newPos) {
    this.x = newPos.x || newPos.col || this.x;
    this.y = newPos.y || newPos.row || this.y;
  }
  setPosition(newPos) {
    this.setPos(newPos);
  }
  get col() {
    return this.x;
  }
  set col(val) {
    this.x = val;
    return val;
  }
  get row() {
    return this.y;
  }
  set row(val) {
    this.y = val;
    return val;
  }
  get position() {
    return {
      x: this.x,
      y: this.y,
      row: this.row,
      col: this.col
    };
  }
}
