import { expect } from 'chai';
import _ from 'lodash';
import Player, { PLAYER_STATES } from '../game/player';
import Lobby, { NAME_VALIDATIONS } from './lobby';

describe('Lobby', () => {
  // again, for the sake of clarity
  const testContext = context;

  describe('isReadyForNextContext', () => {
    testContext('when all players are ready', () => {
      it('should return `true`', () => {
        const createPlayer = () => new Player({ id: Math.random() });
        let players = [createPlayer(), createPlayer(), createPlayer()];
        const lobby = new Lobby({ players });
        _.each(players, (player) => player.state = PLAYER_STATES.READY);
        expect(lobby.isReadyForNextContext()).to.be.true;
      });
    });
    testContext('when NOT all players are ready', () => {
      it('should return `false`', () => {
        const createPlayer = () => new Player({ id: Math.random() });
        const p1 = createPlayer();
        p1.state = PLAYER_STATES.READY;
        const p2 = createPlayer();
        p2.state = PLAYER_STATES.READY;
        const p3 = createPlayer();
        // p3 is NOT ready
        const players = [p1, p2, p3];
        const lobby = new Lobby({ players });
        expect(lobby.isReadyForNextContext()).to.be.false;
      });
    });
  });
  describe('handleMessage', () => {
    testContext('when the player is anonymous', () => {
      testContext('when the name given is valid', () => {
        it('should make their first message their name');
        it('should broadcast their name');
      });
      testContext('when the name given is NOT valid', () => {
        it('should ask for another name');
      });
    });
    testContext('when the player is named', () => {
      it('should broadcast all non-whisper messages');
      it('should send whisper messages');
      it('should change the player\'s state on `ready`');
    });
    testContext('when the player is ready', () => {
      it('should broadcast all non-whisper messages');
      it('should send whisper messages');
    });
    testContext('when the player is in another state', () => {
      it('should produce no responses');
    });
  });
  describe('validateName', () => {
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
  });
});
