import { expect } from 'chai';
import * as Messaging from './messaging';
import { Player } from './player';
import Game from '../context/game';

describe('Server Messaging', () => {
  let player1: Player;
  let player2: Player;
  before(function () {
    player1 = {
      id: '007',
      name: 'James_Bond'
    };

    player2 = {
      id: '117',
      name: 'Master_Chief'
    };
  });
  describe('Game Message', () => {
    it('should return the correct JSON', () => {
      const gbr = Messaging.createGameMessage('welcome to the game', []);

      expect(Messaging.show(gbr)).to.eql({
        type: 'Game',
        message: 'welcome to the game'
      });
    });
  });
  describe('Echo Message', () => {
    it('should return the correct JSON', function () {
      const em = Messaging.createEchoMessage('go north', player1);

      expect(Messaging.show(em)).to.eql({
        type: 'Echo',
        message: 'go north'
      });
    });
  });
  describe('Whisper Message', () => {
    it('should return the correct JSON', function () {
      const wm = Messaging.createWhisperMessage(player1, 'wazzup', player2);

      expect(Messaging.show(wm)).to.eql({
        from: {
          name: 'James_Bond'
        },
        message: 'wazzup',
        type: 'Whisper'
      });
    });
  });
  describe('Talk Message', () => {
    it('should return the correct JSON', function () {
      const tm = Messaging.createTalkMessage(player1, 'greetings', [ player2 ]);

      expect(Messaging.show(tm)).to.eql({
        from: {
          name: 'James_Bond'
        },
        message: 'greetings',
        type: 'Talk'
      });
    });
  });
  describe('Shout Message', () => {
    it('should return the correct JSON', function () {
      const sm = Messaging.createShoutMessage(player1, 'hooray', [ player2 ]);

      expect(Messaging.show(sm)).to.eql({
        from: {
          name: 'James_Bond'
        },
        message: 'hooray',
        type: 'Shout'
      });
    });
  });
  describe('spanMessagePlayerNames', function () {
    let game: Game;
    let player3: Player;
    let content: string;
    let result: Messaging.NameSpan;
    before(function () {
      player1 = {
        id: 'sponge',
        name: 'Spongebob'
      };

      player2 = {
        id: 'starfish',
        name: 'Patrick'
      };

      player3 = {
        id: 'octopus',
        name: 'Squidward'
      };

      game = new Game(8, [ player1, player2, player3 ]);

      content = '/t patrick did you know that squidward plays clarinet?';

      result = Messaging.spanMessagePlayerNames(content, game.players);
    });
    it('should correctly pull the name from the content', function () {
      expect(result.names).to.eql([ 'Patrick' ]);
    });
    it('should get have the rest of the message', function () {
      expect(result.rest).to.equal('did you know that squidward plays clarinet?');
    });
  });
});
