import Entity from '../entity';

export default class Item extends Entity {
  constructor(kwargs = {}) {
    super(kwargs);
    this.owningPlayer = null;
  }
  toJSONObject() {
    return {
      type: 'Item',
      item: this.constructor.name
    };
  }
}
