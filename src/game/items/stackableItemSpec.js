import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import { ItemStack } from './item';

// TODO: need to fix test globbing pattern to find this test
describe('StackableItem', () => {
  describe('constructor', () => {
    it('should default stackAmount and maxStackAmount to 1', () => {
      const si = new StackableItem();

      expect(si.stackAmount).to.equal(1);
      expect(si.maxStackAmount).to.equal(1);
    });
  });
  describe('addToStack', () => {
    beforeEach(test => {
      test.si = new StackableItem(0, 5);
    });
    context('when given at most the max amount', () => {
      it('should return the amount added', test => {
        expect(test.si.isEmpty()).to.be.true;
        const l1 = test.si.addToStack(4);
        expect(test.si.stackAmount).to.equal(4);
        expect(l1).to.equal(4);
        const l2 = test.si.addToStack(1);
        expect(test.si.isFull()).to.be.true;
        expect(l2).to.equal(1);
        test.si.removeAllFromStack();
        expect(test.si.isEmpty()).to.be.true;
        const l3 = test.si.fillStack();
        expect(l3).to.equal(5);
      });
    });
    context('when given over the max amount', () => {
      it('should return the amount added', test => {
        expect(test.si.isEmpty()).to.be.true;
        const l1 = test.si.addToStack(6);
        expect(test.si.isFull()).to.be.true;
        expect(l1).to.equal(5);
      });
    });
  });
  describe('removeFromStack', () => {
    beforeEach((test) => {
      test.si = new StackableItem(3, 5);
    });
    it('should default to one stack removed', (test) => {
      test.si.removeFromStack();
      expect(test.si.stackAmount).to.equal(2);
    });
    it('should update `this` stack amount', (test) => {
      test.si.removeFromStack(3);
      expect(test.si.isEmpty()).to.be.true;
    });
    it('should never go below zero', (test) => {
      //expect(test.si.stackAmount).to.equal(3, 'Should be initialized to 3!!!');
      //expect(test.si.maxStackAmount).to.equal(5, 'Should be initialized to 5!!!');
      const retStack = test.si.removeFromStack(1000);
      expect(test.si.isEmpty()).to.be.true;
      expect(retStack.stackAmount).to.equal(3);
    });
    it('should return a the removed stacks', (test) => {
      const retStack = test.si.removeFromStack(2);

      expect(test.si.hasAny()).to.be.true;
      expect(test.si.stackAmount).to.equal(1);

      expect(retStack.hasAny()).to.be.true;
      expect(retStack.stackAmount).to.equal(2);
      expect(retStack.maxStackAmount).to.equal(test.si.maxStackAmount);
    });
  });
  describe('removeAllFromStack', () => {
    it('should remove stacks from an item', () => {
      const si = new StackableItem(3, 5);

      expect(si.isEmpty()).to.be.false;

      const retStack = si.removeAllFromStack();

      expect(si.isEmpty()).to.be.true;

      expect(retStack.stackAmount).to.equal(3);
    });
  });
});
