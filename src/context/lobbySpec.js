import { expect } from 'chai';
import _ from 'lodash';

describe('Lobby', () => {
  // again, for the sake of clarity
  const testContext = context;

  describe('isReadyForNextContext', () => {
    testContext('when all players are ready', () => {
      it('should return `true`');
    });
    testContext('when NOT all players are ready', () => {
      it('should return `false`');
    });
  });
  describe('handleMessage', () => {
    testContext('when the player is anonymous', () => {
      it('should make their first message their name');
      it('should broadcast their name');
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
});
