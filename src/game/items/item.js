import Entity from '../entity';

export default class Item extends Entity {
  constructor(kwargs = {}) {
    super(kwargs);
    this.owningPlayer = null;
  }
  toJSON() {
    return {
      type: 'Item',
      item: this.constructor.name
    };
  }
}
