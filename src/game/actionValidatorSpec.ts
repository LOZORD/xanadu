//import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import * as _ from 'lodash';
//import actionParser from './actionParser';
//import actionValidator from './actionValidator';
import * as Actions from './actions';
import { Player } from './player';
import Game from '../context/game';

describe('Action Validator', () => {
  beforeEach(function() {
    this.player = {
      id: '007',
      name: 'James_Bond',
      state: 'Preparing'
    };
    // using the default "test" map
    this.game = new Game(8, [this.player]);
    this.args = [this.player.character, null, null];
  });
  describe('on MoveAction', () => {
    describe('when given a valid action', () => {
      it.skip('should return isValid:`true`', function() {
        //const move =
        //  actionParser.parseAction('go south').apply(null, this.args);
        // const validAction = actionValidator(test.game, move);

        const validAction = null;
        expect(validAction.isValid).to.be.true;
      });
    });
    describe('when given an invalid move', () => {
      it.skip('should return isValid:`false` if moving into a non-room', function() {
        /*
        const move =
          actionParser.parseAction('go north').apply(null, test.args);
        const invalidAction = actionValidator(test.game, move);

        expect(invalidAction.isValid).to.be.false;
        */
      });
      it.skip('should return isValid:`false` if moving out of bounds', function() {
        /*
        const m1 = actionParser.parseAction('go south').apply(null, this.args);

        const v1 = actionValidator(this.game, m1);

        // the first move is ok, we should now be at the bottom of the test map
        expect(v1.isValid).to.be.true;

        test.player.character.nextAction = m1;

        const newGame = this.game.update();

        const m2 = actionParser.parseAction('go south').apply(null, this.args);

        const v2 = actionValidator(newGame, m2);
        */

        const v2 = null;

        // this move would put us out of bounds
        expect(v2.isValid).to.be.false;
      });
    });
  });
});
