import { expect } from 'chai';
import _ from 'lodash';
import Player, { PLAYER_STATES } from '../game/player';
import Lobby from './lobby';

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
      it('should return a `true` in the `isValidName` field');
     });
    testContext('when the name is NOT valid', () => {
      it('should return `false` in the `isValidName` field');
      testContext('when the name has been taken', () => {
        it('should return the appropriate `reason`');
      });
      testContext('when the name has invalid characters', () => {
        it('should return the appropriate `reason`');
      });
    });
  });
});
