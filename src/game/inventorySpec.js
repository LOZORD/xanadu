import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import Inventory from './inventory';
import { Stew } from './items/ingestibles/food';
import Rifle from './items/weapons/rifle';

describe('Inventory', () => {
  describe('constructor', () => {
    context('with no arguments', () => {
      it('should default to empty and with a capacity of 10 items', () => {
        const i = new Inventory();

        expect(i.isEmpty()).to.be.true;
        expect(i.capacity).to.equal(10);
      });
    });
    context('with arguments', () => {
      it('should use the arguments', () => {
        const i = new Inventory(1, [ new Stew() ]);
        expect(i.capacity).to.equal(1);
        expect(i.items).to.eql([ new Stew() ]);
        expect(i.isFull()).to.be.true;
        expect(i.hasItem(Stew)).to.be.true;
      });
    });
  });
  describe('isEmpty', () => {
    it('should be true iff there are no items in the inventory', () => {
      const i = new Inventory();

      expect(i.isEmpty()).to.be.true;

      i.addItem(Stew);

      expect(i.isEmpty()).to.be.false;

      i.removeItem(Stew);

      expect(i.isEmpty()).to.be.true;
    });
  });
  describe('isFull', () => {
    it('should be true iif the inventory is at capacity', () => {
      const i = new Inventory(2);

      expect(i.isFull()).to.be.false;

      i.addItem(Stew);
      i.addItem(Rifle);

      expect(i.isFull()).to.be.true;

      i.removeItem(Stew);

      expect(i.isFull()).to.be.false;
    });
  });
  describe('findItemIndex', () => {
    context('when the item is present', () => {
      it('should return the correct index', () => {
        const i = new Inventory();

        i.addItem(Stew);
        i.addItem(Rifle);

        expect(i.findItemIndex(Stew)).to.equal(0);
        expect(i.findItemIndex('Rifle')).to.equal(1);
      });
    });
    context('when the item is NOT present', () => {
      it('should return -1', () => {
        const i = new Inventory();

        expect(i.findItemIndex(Rifle)).to.equal(-1);
      });
    });
  });
  describe('findItem', () => {
    context('when the item is present', () => {
      it('should return the item', () => {
        const i = new Inventory();

        i.addItem(Stew);

        expect(i.findItem('Stew')).to.be.an.instanceOf(Stew);
      });
    });
    context('when the item is NOT present', () => {
      it('should return null', () => {
        const i = new Inventory();

        expect(i.findItem('Stew')).to.be.null;
      });
    });
  });
  describe('addItem', () => {
    context('when attempting to add an item already present in the inventory', () => {
      context('and the item is a StackableItem', () => {
        it('should just increase the stack amount', () => {
          const i = new Inventory();
          i.addItem(Stew);
          const stew = i.findItem('Stew');
          stew.maxStackAmount = 10;
          i.addItem(Stew);
          i.addItem(Stew);
          expect(i.findItem('Stew').stackAmount).to.equal(3);
        });
      });
      context('and the item is NOT a StackableItem', () => {
        it('should throw an error', () => {
          const i = new Inventory();

          const addRifle = () => i.addItem(Rifle);

          expect(addRifle).not.to.throw(Error);
          expect(i.hasRoom()).to.be.true;
          expect(addRifle).to.throw(Error);
        });
      });
    });
    context('when attempting to add to a full inventory', () => {
      it('should throw an error', () => {
        const i = new Inventory(1);

        i.addItem(Stew);

        i.addItem(Stew);

        expect((() => i.addItem(Rifle))).to.throw(Error);
      });
    });
  });
  describe('removeItem', () => {
    context('when the item is present', () => {
      context('and is a StackableItem', () => {
        beforeEach((test) => {
          test.i = new Inventory();
          test.i.addItem(Stew);

          test.stewStack = test.i.findItem(Stew);

          test.stewStack.maxStackAmount = 5;
          // 3 stacks in total
          test.i.addItem(Stew, 2);

          // then remove 2 (should have one left)
          test.removed = test.i.removeItem(Stew, 2);
        });
        it('should remove and return the correct amount', (test) => {
          expect(test.removed).to.be.an.instanceof(Stew);
          expect(test.removed.hasAny()).to.be.true;
          expect(test.removed.stackAmount).to.equal(2);
        });
        it('should delete the item from the inventory if it is empty', (test) => {
          expect(test.i.hasItem('Stew')).to.be.true;
          test.i.removeItem('Stew');
          // now it should be all gone (3 - 2 - 1 = 0)
          expect(test.i.hasItem('Stew')).to.be.false;
        });
      });
      context('and is NOT a StackableItem', () => {
        it('should remove and return the object', () => {
          const i = new Inventory();

          i.addItem(Rifle);

          const ret = i.removeItem('Rifle');

          expect(ret).to.be.an.instanceof(Rifle);
        });
      });
    });
    context('when the item is NOT present', () => {
      it('should throw an error', () => {
        const i = new Inventory();

        expect((() => i.removeItem('Rifle'))).to.throw(Error);
      });
    });
  });
  describe('toJSON', () => {
    it('should return the correct JSON', () => {
      const i = new Inventory();

      expect(i.toJSON()).to.eql([]);

      i.addItem(Stew);
      i.addItem(Rifle);

      const expectedInvArray = [
        (new Stew({ maxStackAmount: 1, stackAmount: 1 })).toJSON(),
        (new Rifle()).toJSON()
      ];

      expect(i.toJSON()).to.eql(expectedInvArray);
    });
  });
});
