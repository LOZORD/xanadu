import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import _ from 'lodash';
import actionParser from './actionParser';
import actionValidator from './actionValidator';
import Player from './player';
import Game from './game';

describe('Action Validator', () => {
  beforeEach(test => {
    test.player = new Player({
      id: '007'
    });
    // using the default "test" map
    test.game = new Game({
      rng: () => 42,
      players: [test.player]
    });
    test.args = [test.player.character, null, null];
  });
  context('when NOT passed an Action object', () => {
    it('should return `false`', (test) => {
      expect(actionValidator(test.game, {})).to.be.false;
    });
  });
  describe('on MoveAction', () => {
    describe('when given a valid action', () => {
      it('should return `true`', (test) => {
        const move =
          actionParser.parseAction('go south').apply(null, test.args);
        const validAction = actionValidator(test.game, move);

        expect(validAction).to.be.true;
      });
    });
    describe('when given an invalid move', () => {
      it('should return `false`', (test) => {
        const move =
          actionParser.parseAction('go north').apply(null, test.args);
        const validAction = actionValidator(test.game, move);

        expect(validAction).to.be.false;
      });
    });
  });
});

