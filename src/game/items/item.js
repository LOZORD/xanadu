import Entity from '../entity';

export default class Item extends Entity {
  constructor(kwargs = {}) {
    super(kwargs);
    this.owner = null;
  }
  toJSON() {
    return {
      type: 'Item',
      item: this.constructor.name
    };
  }
}
