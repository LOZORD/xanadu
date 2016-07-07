import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import actionParser from './actionParser';
import * as Actions from './actions';
import Player from './player';

describe('Action Parser', () => {
  beforeEach(test => {
    test.player = new Player({
      id: '007'
    });
    test.args = [test.player.character, null, null];
  });
  describe('Move Actions', () => {
    it('should return a MoveAction creator', (test) => {
      ['north','south','west','east'].forEach((dir) => {
        const ret = actionParser.parseAction(`go ${ dir }`);

        expect(ret).to.be.a('function');

        const action = ret.apply(null, test.args);

        expect(action.direction).to.equal(dir);
      });
    });
  });
  describe('Unknown Inputs', () => {
    it('should return null', () => {
      const ret = actionParser.parseAction('foobarbaz123');
      expect(ret).to.be.null;
    });
  });
});
