import Item from './item';

export default class StackableItem extends Item {
  constructor(kwargs = {}) {
    super(kwargs);
    this.stackAmount = kwargs.stackAmount || 0;
  }
  hasAny() {
    return this.stackAmount > 0;
  }
  toJSONObject() {
    return {
      type: 'StackableItem',
      item: this.constructor.name,
      amount: this.stackAmount
    };
  }
}

