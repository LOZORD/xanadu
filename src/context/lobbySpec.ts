import { expect } from 'chai';
import * as _ from 'lodash';
import Lobby, { parsePrimordialCharacter } from './lobby';
import * as Messaging from '../game/messaging';
import { LobbyPlayer, getPlayerState } from '../game/player';

describe('Lobby', () => {
  // again, for the sake of clarity
  const testContext = context;

  describe('isReadyForNextContext', () => {
    it('should return true iff all players are ready', () => {
      const lobby = new Lobby(8, [ {
        name: 'Foo',
        id: 'foo'
      }, {
        name: 'Bar',
        id: 'bar'
      }]);

      const foo = lobby.getPlayer('foo');

      foo!.isReady = true;

      expect(lobby.isReadyForNextContext()).to.be.false;

      const bar = lobby.getPlayer('bar');

      bar!.isReady = true;

      expect(lobby.isReadyForNextContext()).to.be.true;
    });
  });

  describe('handleMessage', () => {
    testContext('when the player is anonymous', () => {
      testContext('when the name given is valid', () => {
        beforeEach(function () {
          this.lobby = new Lobby(8, []);

          this.lobby.addPlayer('007');

          this.jbPlayer = this.lobby.getPlayer('007');

          this.messages =
            this.lobby.handleMessage({
              player: this.jbPlayer,
              content: 'James_Bond',
              timestamp: Date.now()
            });
        });
        it('should make their first message their name', function () {
          expect(this.lobby.hasPlayerByName('James_Bond')).to.be.true;
          expect(getPlayerState(this.jbPlayer)).to.equal('Preparing');
        });
        it('should broadcast their name', function () {
          const nameBroadcasted = _
            .some(this.messages as Messaging.Message[],
            message => message.type === 'Game' && _.includes(message.content, 'James_Bond')
            );

          expect(nameBroadcasted).to.be.true;
        });
      });
      testContext('when the name given is NOT valid', () => {
        it('should ask for another name', () => {
          const lobby = new Lobby(8, []);

          lobby.addPlayer('007');

          const p1 = lobby.getPlayer('007');

          if (p1) {
            lobby.handleMessage({
              player: p1,
              content: 'James_Bond',
              timestamp: Date.now()
            });
          } else {
            throw new Error('Test player not present!');
          }

          // now to work with invalid naming attempts

          lobby.addPlayer('008');

          const p2 = lobby.getPlayer('008');

          let m2: Messaging.Message[];
          if (p2) {
            m2 = lobby.handleMessage({
              player: p2,
              content: 'James_Bond',
              timestamp: Date.now()
            });
          } else {
            throw new Error('Test player not present!');
          }

          expect(p2.name).to.not.equal('James_Bond');

          const takenResponse = _.find(m2, (response) => response.type === 'Game');

          expect(takenResponse).to.exist;

          expect(takenResponse.content).to.include('already been taken');

          // now for an invalid character name

          const m3 = lobby.handleMessage({
            content: 'James^&^Bond',
            player: p2,
            timestamp: Date.now()
          });

          const patternResponse = _.find(m3, (response) => response.type === 'Game');

          expect(patternResponse).to.exist;

          expect(patternResponse.content)
            .to.include('only alphanumeric, underscore, and hyphen characters');
        });
      });
    });
    testContext('when the player is named', () => {
      it('should change the player\'s state on `ready` and broadcast', () => {
        const lobby = new Lobby(8, []);

        lobby.addPlayer('007');

        const p1 = lobby.getPlayer('007');

        if (p1) {
          lobby.handleMessage({
            player: p1,
            timestamp: Date.now(),
            content: 'James_Bond'
          });
        } else {
          throw new Error('Test player not present!');
        }

        lobby.handleMessage({
          content: 'Shaken, not stirred',
          player: p1,
          timestamp: Date.now()
        });

        expect(getPlayerState(p1)).to.not.equal('Ready');

        const m3 = lobby.handleMessage({
          content: 'ready',
          player: p1,
          timestamp: Date.now()
        });

        expect(getPlayerState(p1)).to.equal('Ready');

        const readyBroadcastPresent = _.some(m3,
          message => message.type === 'Game' && _.includes(message.content, 'ready'));

        expect(readyBroadcastPresent).to.be.true;
      });
    });
    testContext('when the player is ready', () => {
      before(function () {
        this.lobby = new Lobby(8, [
          { id: '123', name: 'Alice'},
          { id: '456', name: 'Bob'}
        ]);

        const bob = (this.lobby as Lobby).getPlayerByName('Bob');

        bob!.isReady = true;
      });
      it('should default to (global/broadcasted) talk messages');
      it('should send whisper messages');
      it('should be able to reconfigure their primordial character', function () {
        this.player2 = (this.lobby as Lobby).getPlayerByName('Bob');
        (this.lobby as Lobby).handleMessage({
          player: this.player2,
          timestamp: Date.now(),
          content: 'ready c=chef a=west'
        });

        expect(this.player2.primordialCharacter.className).to.equal('Chef');
        expect(this.player2.primordialCharacter.allegiance).to.equal('Western');

        (this.lobby as Lobby).handleMessage({
          player: this.player2,
          timestamp: Date.now(),
          content: 'ready c=doc a=e'
        });

        expect(this.player2.primordialCharacter.className).to.equal('Doctor');
        expect(this.player2.primordialCharacter.allegiance).to.equal('Eastern');
      });
      it('should report any unknown character options', function () {
        const player = (this.lobby as Lobby).getPlayerByName('Alice');

        let responses: Messaging.Message[];

        // re-ready player1
        if (player) {
          responses = (this.lobby as Lobby).handleMessage({
            player,
            timestamp: Date.now(),
            content: 'ReAdY a=_FOO c=_BAR m=_BAZ z=_QUUX'
          });
        } else {
          throw new Error('Test player not present!');
        }

        const gameMsgs = responses.filter(
          msg => msg.type === 'Game' && msg.to[ 0 ].name === 'Alice');

        expect(gameMsgs).to.have.lengthOf(1);

        const theMessage = gameMsgs[ 0 ];

        [ 'Unrecognized key', 'Bad number of modifiers',
          'Unrecognized allegiance', 'Unrecognized character class' ].forEach((str) => {
            expect(theMessage.content).to.include(str);
          });
      });
    });
    testContext('when the player is in another state', () => {
      it('should throw an error');
    });
  });

  describe('parsePrimordialCharacter', function () {
    beforeEach(function () {
      const player: LobbyPlayer = {
        id: '007',
        name: 'James_Bond',
        isReady: false,
        primordialCharacter: {
          className: 'Excavator',
          allegiance: 'Eastern',
          numModifiers: 1
        }
      };

      this.player = player;
    });
    it('should respect already present properties on the primordial character', function () {
      const command = 'ready m=3 a=WE';

      const { log, primordialCharacter } = parsePrimordialCharacter(
        command.split(' '), (this.player as LobbyPlayer).primordialCharacter
      );

      expect(log).to.be.empty;
      expect(primordialCharacter.className).to.equal('Excavator');
      expect(primordialCharacter.allegiance).to.equal('Western');
      expect(primordialCharacter.numModifiers).to.equal(3);

      // this should do nothing
      let newPC = parsePrimordialCharacter(
        [ 'ready' ], primordialCharacter
      ).primordialCharacter;

      expect(newPC).to.eql(primordialCharacter);
    });
    it('should set the number of modifiers to zero if reset', function () {
      const command = 'ready m=0';

      const { log, primordialCharacter } = parsePrimordialCharacter(
        command.split(' '), (this.player as LobbyPlayer).primordialCharacter
      );

      expect(log).to.be.empty;
      expect(primordialCharacter.className).to.eql('Excavator');
      expect(primordialCharacter.allegiance).to.eql('Eastern');
      expect(primordialCharacter.numModifiers).to.eql(0);
    });
  });
});
