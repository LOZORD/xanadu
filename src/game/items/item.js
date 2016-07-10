import Entity from '../entity';

export default class Item extends Entity {
  constructor(row = 0, col = 0) {
    super(row, col);
    this.owner = null;
  }
  toJSON() {
    return {
      type: 'Item',
      item: this.constructor.name
    };
  }
}
