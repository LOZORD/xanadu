import { expect } from 'chai';
import * as Animal from './animal';
import { createInventory } from './inventory';

describe('Animal', function () {
  before(function () {
    this.animal = {
      stats: {
        health: 1,
        strength: 0,
        intelligence: 0,
        agility: 0
      },
      inventory: createInventory([], 0),
      nextAction: null,
      row: 0,
      col: 0
    };
  });
  describe('isAlive', function () {
    context('when the animal has positive health', function () {
      before(function () {
        this.animal.stats.health = 1;
      });
      it('should return true', function () {
        expect(Animal.isAlive(this.animal)).to.be.true;
      });
    });
    context('when the animal has non-positive health', function () {
      before(function () {
        this.animal.stats.health = 0;
      });
      it('should return false', function () {
        expect(Animal.isAlive(this.animal)).to.be.false;
      });
    });
  });
  describe('hasNextAction', function () {
    context('when the animal has a queued action', function () {
      before(function () {
        (this.animal as Animal.Animal).nextAction = {
          key: 'Pass',
          actor: this.animal,
          timestamp: Date.now()
        };
      });
      it('should return true', function () {
        expect(Animal.hasNextAction(this.animal)).to.be.true;
      });
    });
    context('when the animal has no next action', function () {
      before(function () {
        (this.animal as Animal.Animal).nextAction = null;
      });
      it('should return false', function () {
        expect(Animal.hasNextAction(this.animal)).to.be.false;
      });
    });
  });
});
