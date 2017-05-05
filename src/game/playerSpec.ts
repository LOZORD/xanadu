import { expect } from 'chai';
import * as Player from './player';
import Game from '../context/game';

describe('Player', function () {
  describe('getPlayerState', function () {
    context('when the (lobby) player has no name', function () {
      it('should return `Anon`', function () {
        const player: Player.LobbyPlayer = {
          socketId: '1234',
          persistentId: 'testId',
          name: null,
          primordialCharacter: {
            allegiance: 'None',
            className: 'None',
            numModifiers: 0
          },
          isReady: false
        };

        expect(Player.getPlayerState(player)).to.eql('Anon');
      });
    });
    context('when the (lobby) player is not ready', function () {
      it('should return `Preparing`', function () {
        const player: Player.LobbyPlayer = {
          socketId: '1234',
          persistentId: 'testId',
          name: 'Foobar',
          primordialCharacter: {
            allegiance: 'None',
            className: 'None',
            numModifiers: 0
          },
          isReady: false
        };

        expect(Player.getPlayerState(player)).to.eql('Preparing');
      });
    });
    context('when the (lobby) player is ready', function () {
      it('should return `Ready`', function () {
        const player: Player.LobbyPlayer = {
          socketId: '1234',
          persistentId: 'testId',
          name: 'Foobar',
          primordialCharacter: {
            allegiance: 'None',
            className: 'None',
            numModifiers: 0
          },
          isReady: true
        };

        expect(Player.getPlayerState(player)).to.eql('Ready');
      });
    });
    context('when the (game) player in playing', function () {
      it('should return `Playing`', function () {
        const player: Player.Player = {
          socketId: '1234',
          persistentId: 'testId',
          name: 'Foobar'
        };

        const game = new Game(8, [ player ]);

        const gamePlayer = game.getPlayerBySocketId('1234');

        expect(Player.getPlayerState(gamePlayer!)).to.eql('Playing');
      });
    });
    context('when the (game) player is dead', function () {
      it('should return `Dead`', function () {
        const player: Player.Player = {
          socketId: '1234',
          persistentId: 'testId',
          name: 'Foobar'
        };

        const game = new Game(8, [ player ]);

        const gamePlayer = game.getPlayerBySocketId('1234');

        gamePlayer!.character.stats.health = 0;

        expect(Player.getPlayerState(gamePlayer!)).to.eql('Dead');
      });
    });
    context('whe the (game) player has escaped', function () {
      it('should return `Spectating`', function () {
        const player: Player.Player = {
          socketId: '1234',
          persistentId: 'testId',
          name: 'Foobar'
        };

        const game = new Game(8, [ player ]);

        const gamePlayer = game.getPlayerBySocketId('1234');

        gamePlayer!.character.hasEscaped = true;

        expect(Player.getPlayerState(gamePlayer!)).to.eql('Spectating');
      });
    });
  });
});
