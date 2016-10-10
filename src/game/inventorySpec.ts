import { expect } from 'chai';
import * as Inventory from './inventory';
import { createItemStack } from './items/item';
import { createItem } from './items/itemCreator';

describe('Inventory', () => {
  describe('createInventory', () => {
    context('with arguments', () => {
      it('should use the arguments', () => {
        const i = Inventory.createInventory([ createItemStack(createItem('Stew'), 1) ], 1);
        expect(i.maximumCapacity).to.equal(1);
        expect(i.itemStacks).to.eql([ createItemStack(createItem('Stew'), 1) ]);
        expect(Inventory.inventoryIsFull(i)).to.be.true;
        expect(Inventory.hasItem(i, 'Stew')).to.be.true;
      });
    });
  });
  describe('isEmpty', () => {
    it('should be true iff there are no items in the inventory', () => {
      const i1 = Inventory.createInventory([], 1000);

      expect(Inventory.inventoryIsEmpty(i1)).to.be.true;

      const i2 = Inventory.createInventory([ createItemStack(createItem('Stew'), 1) ], 1000);

      expect(Inventory.inventoryIsEmpty(i2)).to.be.false;
    });
  });
  describe('isFull', () => {
    it('should be true iff the inventory is at capacity', () => {
      const i1 = Inventory.createInventory([], 2);

      expect(Inventory.inventoryIsFull(i1)).to.be.false;

      const stacks = [
        createItemStack(createItem('Stew'), 1),
        createItemStack(createItem('Rifle'), 1)
      ];

      const i2 = Inventory.createInventory(stacks, 2);

      expect(Inventory.inventoryIsFull(i2)).to.be.true;
    });
  });
  describe('getItem', () => {
    context('when the item is present', () => {
      it('should return the item', () => {
        const i = Inventory.createInventory([ createItemStack(createItem('Stew'), 1) ], 5);

        expect(Inventory.getItem(i, 'Stew')).to.be.ok;
      });
    });
    context('when the item is NOT present', () => {
      it('should return null', () => {
        const i = Inventory.createInventory([], 5);

        expect(Inventory.getItem(i, 'Stew')).to.not.be.ok;
      });
    });
  });
  describe('updateInventory', () => {
    context('when the item is already present in the inventory', () => {
      it('should update the current amount', () => {
        const i1 = Inventory.createInventory([ createItemStack(createItem('Stew'), 1, 5) ], 5);

        expect(Inventory.getItem(i1, 'Stew').stackAmount).to.equal(1);

        const i2 = Inventory.updateInventory(i1, 'Stew', 3);

        expect(Inventory.getItem(i2, 'Stew').stackAmount).to.equal(4);
      });
    });
    context('when the item is NOT present in the inventory', () => {
      it('should add the item when `amount` is positive', () => {
        const i1 = Inventory.createInventory([], 5);

        const i2 = Inventory.updateInventory(i1, 'Stew', 5);

        expect(Inventory.hasItem(i2, 'Stew')).to.be.true;
        expect(Inventory.getItem(i2, 'Stew').stackAmount).to.equal(5);
      });
      it('should throw an error if amount is non-positive', () => {
        const i1 = Inventory.createInventory([], 5);
        const nonPosUpdate = () => Inventory.updateInventory(i1, 'Stew', -1234);
        expect(nonPosUpdate).to.throw(Error);
      });
      it('should throw an error if the inventory is full', () => {
        const i1 = Inventory.createInventory([ createItemStack(createItem('Stew'), 2, 5) ], 1);
        expect(Inventory.inventoryIsFull(i1)).to.be.true;
        const fullUpdate = () => Inventory.updateInventory(i1, 'Rifle', 1);
        expect(fullUpdate).to.throw(Error);
      });
    });
    it('should not modify the argument inventory');
  });
  describe('toJSON', () => {
    it('should return the correct result');
  });
});
