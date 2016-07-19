//import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import * as Actions from './actions';
import { Player } from './player';
import { forEach as _forEach } from 'lodash';

describe('Action Parser', () => {
  beforeEach(function() {
    this.player = {
      id: '007',
      name: 'James_Bond',
      state: 'Preparing',
      character: {
        row: 1,
        col: 1
      }
    };
    this.args = [this.player.character, null, null];
  });
  describe('isParsableAction', () => {
    context('when given a valid action command', () => {
      it('should return true', () => {
        expect(Actions.isParsableAction('go south')).to.be.true;
      });
    });
    context('when given an invalid action command', () => {
      it('should return false', () => {
        // sadly false
        expect(Actions.isParsableAction('listen to 2112')).to.be.false;
      });
    });
  });
  describe('MoveAction', () => {
    it('parsing should return a MoveAction', function() {
      // all locations are based off of starting position (1,1)
      const locations = {
        'north': {
          r: 0, c: 1
        },
        'south': {
          r: 2, c: 1
        },
        'west': {
          r: 1, c: 0
        },
        'east': {
          r: 1, c: 2
        }
      };

      _forEach(locations, ({ r, c }, dir) => {
        const action = <Actions.MoveAction> Actions.parseAction(`go ${ dir }`, this.player.character, Date.now());

        expect(action).to.be.ok;

        const newR = this.player.character.row + action.offsetRow;
        const newC = this.player.character.col + action.offsetCol;

        expect(newR).to.equal(r, `when moving ${ dir }`);
        expect(newC).to.equal(c, `when moving ${ dir }`);
      });
    });
  });
  describe('Unknown Inputs', () => {
    it('should return null', function() {
      const ret = Actions.parseAction('foobarbaz123', this.player.character, Date.now());
      expect(ret).to.be.null;
    });
  });
});
