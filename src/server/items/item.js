import Entity from '../entity';

export default class Item extends Entity {
  constructor(kwargs = {}) {
    super(kwargs);
    this.owningPlayer = null;
  }
  moveUp() {
    throw 'Cannot move an item `up`';
  }
  moveDown() {
    throw 'Cannot move an item `down`';
  }
  moveLeft() {
    throw 'Cannot move an item `left`';
  }
  moveRight() {
    throw 'Cannot move an item `right`';
  }
  toJSONObject() {
    return {
      type: 'Item',
      item: this.constructor.name
    };
  }
}
