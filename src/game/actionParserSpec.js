import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import actionParser from './actionParser';
import * as Actions from './actions';

describe('Action Parser', () => {
  describe('Move Actions', () => {
    it('should return a MoveAction creator', () => {
      const otherArgs = [null, null, null]; // don't care about these...

      ['north','south','west','east'].forEach((dir) => {
        const ret = actionParser.parseAction(`go ${ dir }`);

        expect(ret).to.be.a('function');

        const action = ret.apply(null, otherArgs);

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
