import _ from 'lodash';
export default class Entity {
  // origin (0,0) is at NW corner of the map
  constructor(args = {}) {
    this.x = args.x || 0;
    this.y = args.y || 0;
  }
  setPos(...args) {
    if (_.isPlainObject(args[0])) {
      const newPos = args[0];
      this.x = newPos.x || newPos.col;
      this.y = newPos.y || newPos.row;
    } else if (_.isNumber(args[0]) && _.isNumber(args[1])) {
      this.row = args[0];
      this.col = args[1];
    } else {
      throw new TypeError('`setPos` must be passed a coordinate pair or two numbers!');
    }
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
