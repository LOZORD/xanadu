import { it, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import * as Responses from '../game/messaging';
import Context from './context';
import SimpleCommunicationHandler from './communicationHandler';

describe('SimpleCommunicationHandler', () => {
  beforeEach((test) => {
    const players = [
      { id: '123', name: 'alpha' },
      { id: '456', name: 'beta' },
      { id: '789', name: 'gamma' }
    ];
    test.myContext = new Context({ players });
  });

  context('when not given a prefix', () => {
    it('should return a BroadcastResponse', (test) => {
      const messageObj = { message: 'hello world' };
      const fromPlayer = test.myContext.getPlayerWithName('alpha');

      let response = SimpleCommunicationHandler(messageObj, fromPlayer, test.myContext);

      expect(response).to.be.an.instanceof(Responses.BroadcastResponse);
      expect(response.message).to.equal('hello world');
    });
  });

  context('when given a `whisper` prefix', () => {
    it('should return a WhisperResponse', (test) => {
      const messages = ['whisper beta wazzup', 'w gamma yo gamma'];

      const fromPlayer = test.myContext.getPlayer('123');

      const mO1 = { message: messages[0] };

      const r1 = SimpleCommunicationHandler(mO1, fromPlayer, test.myContext);

      expect(r1).to.be.an.instanceof(Responses.WhisperResponse);
      expect(r1.message).to.equal('wazzup');
      expect(r1.from).to.eql(fromPlayer);
      expect(r1.to).to.eql(test.myContext.getPlayerWithName('beta'));

      const mO2 = { message: messages[1] };

      const r2 = SimpleCommunicationHandler(mO2, fromPlayer, test.myContext);

      expect(r2).to.be.an.instanceof(Responses.WhisperResponse);
      expect(r2.message).to.equal('yo gamma');
      expect(r2.from).to.eql(fromPlayer);
      expect(r2.to).to.eql(test.myContext.getPlayerWithName('gamma'));
    });
  });

  context('when given a `chat` prefix', () => {
    it('should return a ChatResponse');
  });
});
