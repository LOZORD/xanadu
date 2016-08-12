import { expect } from 'chai';
import * as _ from 'lodash';
import { Player, PlayerState } from '../game/player';
import Lobby from './lobby';
import * as Messaging from '../game/messaging';

describe('Lobby', () => {
  // again, for the sake of clarity
  const testContext = context;

  describe('isReadyForNextContext', () => {
    it('should return true iff all players are ready', () => {
      const lobby = new Lobby(8, [{
        name: 'Foo',
        id: 'foo',
        state: 'Ready'
      }, {
        name: 'Bar',
        id: 'bar',
        state: 'Preparing'
      }]);

      expect(lobby.isReadyForNextContext()).to.be.false;

      lobby.updatePlayer('bar', { state: 'Ready' });

      expect(lobby.isReadyForNextContext()).to.be.true;
    });
  });

  describe('handleMessage', () => {
    testContext('when the player is anonymous', () => {
      testContext('when the name given is valid', () => {
        beforeEach(function() {
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
        it('should make their first message their name', function() {
          expect(this.lobby.hasPlayerByName('James_Bond')).to.be.true;
          expect(this.jbPlayer.state).to.equal('Preparing');
        });
        it('should broadcast their name', function() {
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

          const m1 = lobby.handleMessage({
            player: p1,
            content: 'James_Bond',
            timestamp: Date.now()
          });

          // now to work with invalid naming attempts

          lobby.addPlayer('008');

          const p2 = lobby.getPlayer('008');

          const m2 = lobby.handleMessage({
            player: p2,
            content: 'James_Bond',
            timestamp: Date.now()
          });

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
      // do we really need to test these here?
      //it('should broadcast all non-whisper messages');
      //it('should send whisper messages');
      it('should change the player\'s state on `ready` and broadcast', () => {
        const lobby = new Lobby(8, []);

        lobby.addPlayer('007');

        const p1 = lobby.getPlayer('007');

        const m1 = lobby.handleMessage({
          player: p1,
          timestamp: Date.now(),
          content: 'James_Bond'
        });

        const m2 = lobby.handleMessage({
          content: 'Shaken, not stirred',
          player: p1,
          timestamp: Date.now()
        });

        expect(p1.state).to.not.equal('Ready');

        const m3 = lobby.handleMessage({
          content: 'ready',
          player: p1,
          timestamp: Date.now()
        });

        expect(p1.state).to.equal('Ready');

        const readyBroadcastPresent = _.some(m3,
          message => message.type === 'Game' && _.includes(message.content, 'ready'));

        expect(readyBroadcastPresent).to.be.true;
      });
    });
    testContext('when the player is ready', () => {
      it('should default to (global/broadcasted) talk messages');
      it('should send whisper messages');
    });
    testContext('when the player is in another state', () => {
      it('should produce no responses', () => {
        const lobby = new Lobby(8, []);

        lobby.addPlayer('007');

        const p1 = lobby.getPlayer('007');

        // should never happen :^)
        p1.state = 'Dead';

        const m1 = lobby.handleMessage({
          content: 'James_Bond',
          player: p1,
          timestamp: Date.now()
        });

        expect(p1.name).to.not.equal('James_Bond');

        expect(m1.length).to.equal(1);

        expect(m1[0].type).to.equal('Echo');
      });
    });
  });
  describe.skip('validateName', () => {
    /* TODO: this has been moved to Context
    testContext('when the name is valid', () => {
      it('should return `NAME_VALIDATIONS.VALID`', () => {
        const lobby = new Lobby();

        const validName = 'James_Bond';

        // since the lobby is empty, there should be no one with the same name
        expect(lobby.validateName(validName)).to.equal(NAME_VALIDATIONS.VALID);
      });
    });
    testContext('when the name is NOT valid', () => {
      testContext('when the name has been taken', () => {
        it('should return NAME_VALIDATIONS.TAKEN', () => {
          const l1 = new Lobby();

          const validName = 'James_Bond';

          const { lobby: l2, player: p1 } = l1.addPlayer('007');

          p1.name = validName;

          const { lobby: l3, player: p2 } = l2.addPlayer('008');

          expect(l3.validateName(validName)).to.equal(NAME_VALIDATIONS.TAKEN);
        });
      });
      testContext('when the name has invalid characters', () => {
        it('should return NAME_VALIDATIONS.INVALID_CHARACTERS', () => {
          const lobby = new Lobby();

          const invalidName = 'James( )Bond$%^&';

          expect(lobby.validateName(invalidName))
          .to.equal(NAME_VALIDATIONS.INVALID_CHARACTERS);
        });
      });
    });
    */
  });
});
