import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import StackableItem from './stackableItem';

// TODO: need to fix test globbing pattern to find this test
describe.skip('StackableItem', () => {
  describe('constructor', () => {
    it('should default stackAmount and maxStackAmount to 1', () => {
      const si = new StackableItem();

      expect(si.stackAmount).to.equal(1);
      expect(si.maxStackAmount).to.equal(1);
    });
  });
  describe('addToStack', () => {
    it('should be tested!');
  });
  describe('removeFromStack', () => {
    beforeEach((test) => {
      test.si = new StackableItem({
        stackAmount: 3,
        maxStackAmount: 5
      });
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
      const si = new StackableItem({ stackAmount: 3, maxStackAmount: 5 });

      expect(si.isEmpty()).to.be.false;

      const retStack = si.removeAllFromStack();

      expect(si.isEmpty()).to.be.true;

      expect(retStack.stackAmount).to.equal(3);
    });
  });
});
