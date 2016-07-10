import _ from 'lodash';
import StackableItem from './items/stackableItem';

export default class Inventory {
  constructor(maxNumItems = 10, items = []) {
    this.maxNumItems = maxNumItems;
    this.items = _.take(items, this.maxNumItems);
  }
  get capacity() {
    return this.maxNumItems;
  }
  isEmpty() {
    return this.items.length === 0;
  }
  isFull() {
    return this.items.length === this.maxNumItems;
  }
  hasRoom() {
    return !this.isFull();
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
  hasItem(constructor) {
    return this.findItemIndex(constructor) > -1;
  }
  // XXX: allow for construction args?
  // TODO: allow for adding already created objects
  // in fact, this could be a wrapper method that passes the object
  // to another method, or if a constructor is given, creates a new object
  // and passes _that_ to the other method
  // TODO: allow the ability to add already-constructed items
  addItem(constructor, amount = 1) {
    let existingItem = this.findItem(constructor);

    if (existingItem) {
      if (existingItem instanceof StackableItem) {
        return existingItem.addToStack(amount);
      } else {
        throw new Error(`Tried to add an item ${ constructor.name } already in the inventory!`);
      }
    } else {
      if (this.hasRoom()) {
        let newItem;
        if (StackableItem.isPrototypeOf(constructor)) {
          newItem = new (constructor)(amount);
        } else {
          newItem = new (constructor)();
        }

        this.items.push(newItem);

        return newItem;
      } else {
        throw new Error('Inventory full!');
      }
    }
  }
  removeItem(constructor, removeAmount = 1) {
    if (this.hasItem(constructor)) {
      let itemIndex = this.findItemIndex(constructor);
      let item = this.items[itemIndex];

      if (item instanceof StackableItem) {
        let removedStackItem = item.removeFromStack(removeAmount);

        // if there's nothing left, remove the item
        if (item.isEmpty()) {
          _.pullAt(this.items, itemIndex);
        }

        return removedStackItem;
      } else {
        return _.pullAt(this.items, itemIndex)[0];
      }
    } else {
      throw new Error(`Could not find item ${ constructor.name } in inventory!`);
    }
  }
  toJSON() {
    return _.map(this.items, (item) => item.toJSON());
  }
}
