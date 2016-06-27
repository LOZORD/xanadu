import { it, before, beforeEach } from 'arrow-mocha/es5';
import { expect } from 'chai';
import _ from 'lodash';
import * as Responses from './messaging';

describe('Server Messaging Responses', () => {
  describe('GameBroadcastResponse', () => {
    it('should return the correct JSON', () => {
      const gbr = new Responses.GameBroadcastResponse('welcome to the game');

      expect(gbr.toJSON()).to.eql({
        type: 'game-broadcast',
        message: 'welcome to the game'
      });
    });
  });
  describe('PlayerResponse', () => {
    context('when missing `from` or `to`', () => {
      it('should throw an error', () => {
        const missingFrom = () => new Responses.PlayerResponse('hi', {}, undefined);

        expect(missingFrom).to.throw(Error);
      });
    });
    context('when missing `to`', () => {
      it('should throw an error', () => {
        const missingTo   = () => new Responses.PlayerResponse('yo', undefined, {});

        expect(missingTo).to.throw(Error);
      });
    });
  });
  describe('MultiplePlayerResponse (using subclass ChatResponse)', () => {
    before((test) => {
      test.players = [
        { id: '123', name: 'alpha' },
        { id: '456', name: 'beta' },
        { id: '789', name: 'gamma' }
      ];

      test.toList = [test.players[1], test.players[2]];
      test.from = test.players[0];

    });
    context('when the `to` argument is not a list', () => {
      it('should throw an error', (test) => {
        expect(() => new Responses.ChatResponse(
            'failure', test.players[1], test.players[0])
        ).to.throw(Error);
      });
    });
    context('when given personalized messages', () => {
      before((test) => {
        test.r = new Responses.ChatResponse({ '456': 'yo beta', '789': 'hi gamma' }, test.toList, test.from);
      });
      it('calling `isPersonalized` should be true', (test) => {
        expect(test.r.isPersonalized()).to.be.true;
      });
      it('calling `toJSON` without a socket id argument should throw an error', (test) => {
        expect(() => test.r.toJSON()).to.throw(Error);
      });
      it('calling `toPersonalizedJSON` without a socket id argument should throw an error', (test) => {
        expect(() => test.r.toPersonalizedJSON()).to.throw(Error);
      });
      it('calling `toPersonalizedJSON` without a present id should throw an error', (test) => {
        expect(() => test.r.toPersonalizedJSON('xyz')).to.throw(Error);
      });
      it('`toPersonalizedJSON` and `toJSON` (with id argument) should yield the same results', (test) => {
        expect(test.r.toPersonalizedJSON('789')).to.eql(test.r.toJSON('789'));
      });
      it('calling `toPersonalizedJSON` should return the correct JSON', (test) => {
        expect(test.r.toPersonalizedJSON('789')).to.eql({
          message: 'hi gamma',
          type: 'chat',
          to: {
            id: '789',
            name: 'gamma'
          },
          from: {
            id: '123',
            name: 'alpha'
          }
        });
      });
    });
    context('when NOT given personalized messages', () => {
      before((test) => {
        test.r = new Responses.ChatResponse('hello all', test.toList, test.from);
      });
      it('calling `isPersonalized` should be false', (test) => {
        expect(test.r.isPersonalized()).to.be.false;
      });
      it('`toPersonalizedJSON` and `toJSON` should yield the same results', (test) => {
        expect(test.r.toPersonalizedJSON(null)).to.eql(test.r.toJSON());
      });
    });
  });
});
