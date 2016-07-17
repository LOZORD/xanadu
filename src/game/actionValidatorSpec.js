import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import _ from 'lodash';
import actionParser from './actionParser';
import actionValidator from './actionValidator';
import Player from './player';
import Game from '../context/game';

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
      expect(actionValidator(test.game, {}).isValid).to.be.false;
    });
  });
  describe('on MoveAction', () => {
    describe('when given a valid action', () => {
      it('should return isValid:`true`', (test) => {
        const move =
          actionParser.parseAction('go south').apply(null, test.args);
        const validAction = actionValidator(test.game, move);

        expect(validAction.isValid).to.be.true;
      });
    });
    describe('when given an invalid move', () => {
      it('should return isValid:`false` if moving into a non-room', (test) => {
        const move =
          actionParser.parseAction('go north').apply(null, test.args);
        const invalidAction = actionValidator(test.game, move);

        expect(invalidAction.isValid).to.be.false;
      });
      it('should return isValid:`false` if moving out of bounds', (test) => {
        const m1 = actionParser.parseAction('go south').apply(null, test.args);

        const v1 = actionValidator(test.game, m1);

        // the first move is ok, we should now be at the bottom of the test map
        expect(v1.isValid).to.be.true;

        test.player.character.nextAction = m1;

        const newGame = test.game.update();

        const m2 = actionParser.parseAction('go south').apply(null, test.args);

        const v2 = actionValidator(newGame, m2);

        // this move would put us out of bounds
        expect(v2.isValid).to.be.false;
      });
    });
  });
});

