import _ from 'lodash';
import StackableItem from './items/stackableItem';

export default class Inventory {
  constructor(kwargs) {
    this.maxNumItems = kwargs.maxNumItems || 10;
    this.items = kwargs.items || [];
    this.owningPlayer = kwargs.owningPlayer || null;
  }
  isEmpty() {
    return this.items.length === 0;
  }
  isFull() {
    return this.items.length === this.maxNumItems;
  }
  findItemIndex(constructor) {
    let constructorName = null;

    if (_.isString(constructor)) {
      constructorName = constructor;
    } else {
      constructorName = constructor.name;
    }

    let itemIndex = _.findIndex(this.items, (item) => item.constructor.name === constructorName);

    return itemIndex;
  }
  findItem(constructor) {
    let ind = this.findItemIndex(constructor);
    if (ind > -1) {
      return this.items[ind];
    } else {
      return null;
    }
  }
  addItem(constructor, n = 1) {
    let existingItem = this.findItem(constructor);
    console.log('TODO', n);

    if (existingItem) {
      if (existingItem instanceof StackableItem) {
        // TODO: implement case of adding to existing StackableItem
      } else {
        // TODO: implement case of adding to a non-StackableItem that already exists
      }
    } else {
      // TODO: this looks suspicious
      // What I want to do is check if this
      // constructor function is a subclass of StackableItem
      if (Object.getPrototypeOf(constructor) === StackableItem) {
        // TODO: implement case of adding a StackableItem that doesn't exist in this.items yet
      } else {
        // TODO: implement case of adding a non-StackableItem that doesn't exist in this.items yet
      }
    }
  }
  removeItem(constructor, n = 1) {
    let constructorName = null;

    if (_.isString(constructor)) {
      constructorName = constructor;
    } else {
      constructorName = constructor.name;
    }

    let itemIndex = _.findIndex(this.items, (item) => item.constructor.name === constructorName);

    if (itemIndex < 0) {
      throw `Could not find instance of ${ constructorName } in inventory!`;
    }

    let itemToRemove = this.items[itemIndex];

    if (itemToRemove instanceof StackableItem) {
      let currentAmount = itemToRemove.stackAmount;
      let amountToRemove = null;
      // if n < 0, remove all
      if (n < 0) {
        amountToRemove = currentAmount;
      } else {
        amountToRemove = _.min([currentAmount, n]);
      }

      itemToRemove.stackAmount -= amountToRemove;

      if (itemToRemove.stackAmount === 0) {
        _.pullAt(this, itemIndex);
      }

      return new (itemToRemove.constructor)({
        stackAmount: amountToRemove
      });
    } else {
      return _.pullAt(this.items, itemIndex);
    }
  }
  toJSON() {
    let outputObjs = _.map(this.items, (item) => item.toJSONObject());

    return JSON.stringify(outputObjs);
  }
}
