import { expect } from 'chai';
import * as Responses from '../game/messaging';
import SimpleCommunicationHandler from './communicationHandler';

describe('SimpleCommunicationHandler', () => {
  context('when not given a prefix', () => {
    it('should return a BroadcastResponse');
  });

  context('when given a `whisper` prefix', () => {
    it('should return a WhisperResponse');
  });

  context('when given a `chat` prefix', () => {
    it('should return a ChatResponse');
  });
});
