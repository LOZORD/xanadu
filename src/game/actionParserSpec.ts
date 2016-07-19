//import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import * as Actions from './actions';
import { Player } from './player';

describe('Action Parser', () => {
  beforeEach(function() {
    this.player = {
      id: '007',
      name: 'James_Bond',
      state: 'Preparing'
    };
    this.args = [this.player.character, null, null];
  });
  describe('isParsableAction', () => {
    context('when given a valid action command', () => {
      it.skip('should return true', () => {
        //expect(actionParser.isParsableAction('go south')).to.be.true;
      });
    });
    context('when given an invalid action command', () => {
      it.skip('should return false', () => {
        // sadly false
        //expect(actionParser.isParsableAction('listen to 2112')).to.be.false;
      });
    });
  });
  describe('Move Actions', () => {
    it.skip('should return a MoveAction creator', function() {
      ['north', 'south', 'west', 'east'].forEach((dir) => {
        // FIXME: implement actions
        //const ret = actionParser.parseAction(`go ${ dir }`);

        //expect(ret).to.be.a('function');

        //const action = ret.apply(null, test.args);

        const action = null;

        expect(action.direction).to.equal(dir);
      });
    });
  });
  describe('Unknown Inputs', () => {
    it('should return null', () => {
      //const ret = actionParser.parseAction('foobarbaz123');
      const ret = false;
      expect(ret).to.be.null;
    });
  });
});
