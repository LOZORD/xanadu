import _ from 'lodash';
import Item from './item';

export default class StackableItem extends Item {
  constructor(kwargs = {}) {
    super(kwargs);
    this.stackAmount = _.isNumber(kwargs.stackAmount) ? kwargs.stackAmount : 1;
    this.maxStackAmount = kwargs.maxStackAmount || 1;
  }
  isEmpty() {
    return this.stackAmount === 0;
  }
  isFull() {
    return this.stackAmount === this.maxStackAmount;
  }
  hasAny() {
    return !this.isEmpty();
  }
  addToStack(n = 1) {
    if (n < 1) {
      n = 1;
    }

    const oldStackAmount = this.stackAmount;

    const newStackAmount = Math.min(oldStackAmount + n, this.maxStackAmount);

    this.stackAmount = newStackAmount;

    // return the amount added
    return newStackAmount - oldStackAmount;
  }
  removeFromStack(n = 1) {
    if (n > this.stackAmount) {
      n = this.stackAmount;
    }

    this.stackAmount = Math.max(this.stackAmount - n, 0);
    return new (this.constructor)({
      stackAmount: n,
      maxStackAmount: this.maxStackAmount
    });
  }
  removeAllFromStack() {
    return this.removeFromStack(this.maxStackAmount);
  }
  fillStack() {
    return this.addToStack(this.maxStackAmount);
  }
  toJSON() {
    return {
      type: 'StackableItem',
      item: this.constructor.name,
      amount: this.stackAmount
    };
  }
}

