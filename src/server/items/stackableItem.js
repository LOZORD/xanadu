import Item from './item';

export default class StackableItem extends Item {
  constructor(kwargs = {}) {
    super(kwargs);
    this.stackAmount = kwargs.stackAmount || 0;
    this.maxStackAmount = kwargs.maxStackAmount || 0;
  }
  hasAny() {
    return this.stackAmount > 0;
  }
  addToStack(n = 1) {
    this.stackAmount = Math.min(this.stackAmount + n, this.maxStackAmount);
    return this.stackAmount;
  }
  removeFromStack(n = 1) {
    this.stackAmount = Math.max(this.stackAmount - n, 0);
    return this.stackAmount;
  }
  toJSONObject() {
    return {
      type: 'StackableItem',
      item: this.constructor.name,
      amount: this.stackAmount
    };
  }
}

