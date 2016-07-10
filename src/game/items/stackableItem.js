import _ from 'lodash';
import Item from './item';

export default class StackableItem extends Item {
  constructor(stackAmount = null, maxStackAmount = 1, row = 0, col = 0) {
    super(row, col);
    // isNumber is true for otherwise falsy 0
    this.stackAmount = _.isNumber(stackAmount) ? stackAmount : 1;
    this.maxStackAmount = Math.max(this.stackAmount, maxStackAmount);
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
    let addAmount;

    if (n < 1) {
      addAmount = 1;
    } else {
      addAmount = n;
    }

    const oldStackAmount = this.stackAmount;

    const newStackAmount =
      Math.min(oldStackAmount + addAmount, this.maxStackAmount);

    this.stackAmount = newStackAmount;

    // return the amount added
    return newStackAmount - oldStackAmount;
  }
  removeFromStack(n = 1) {
    let removeAmount;

    if (n > this.stackAmount) {
      removeAmount = this.stackAmount;
    } else {
      removeAmount = n;
    }

    this.stackAmount = this.stackAmount - removeAmount;

    // since the constructor (or its args) for whatever subclass is unknown,
    // just create the object using the default parameters,
    // and then update the ones we need below
    let removed = new (this.constructor)();

    removed.maxStackAmount = this.maxStackAmount;
    removed.stackAmount = removeAmount;

    return removed;
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

