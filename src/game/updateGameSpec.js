import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import _ from 'lodash';
import actionParser from './actionParser';
import updateGame from './updateGame';
import Game from './game';
import Player from './player';
import Action from './actions';

describe('Update Game', () => {
  beforeEach(test => {
    test.player = new Player({
      id: '007'
    });
    // uses the test map
    test.game = new Game({
      players: [test.player],
      rng: () => 42
    });
    test.args = [test.player.character, null, null];
  });
  describe('on MoveAction', () => {
    it('should move the player\'s character', test => {
      const moveMessages = [
        { message: 'go south', dest: { row: 2, col: 1 } },
        { message: 'go north', dest: { row: 1, col: 1 } },
        { message: 'go west', dest: { row: 1, col: 0 } },
        { message: 'go east', dest: { row: 1, col: 1 } },
        { message: 'go west', dest: { row: 1, col: 0 } }
      ];

      _.forEach(moveMessages, ({ message, dest }) => {
        const move = actionParser.parseAction(message).apply(null, test.args);

        // true -> fail loudly on any invalid moves
        updateGame(test.game, move, true);

        const newPos = test.player.character.position;

        expect(newPos.row).to.equal(dest.row, message + ' row');
        expect(newPos.col).to.equal(dest.col, message + ' col');
      });
    });
  })
});
