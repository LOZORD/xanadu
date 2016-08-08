import * as _ from 'lodash';
import { expect } from 'chai';
import Server from './server';
import * as Winston from 'winston';

describe('Server', () => {
  const createServer = () => {
    return new Server(8, 3000, Date.now().toString(), false, Winston);
  };

  describe('start', () => {
    before(function() {
      this.server = createServer();
    });
    after(function() {
      return this.server.stop();
    });
    it('should run correctly', function() {
      return this.server.start().then((startedServer) => {
        expect(startedServer).to.be.ok;
      });
    });
  });

  describe('getSocket', () => {
    context('when the socket is present', () => {
      it('should return the socket');
    });
    context('when the socket is NOT present', () => {
      it('should return undefined', () => {
        const s = createServer();

        expect(s.getSocket('007')).to.be.undefined;
      });
    });
  });

  describe('addPlayer', () => {
    it('should add the player', () => {
      const s = createServer();

      s.addPlayer('007');

      expect(s.currentContext.getPlayer('007')).to.be.ok;
    });
  });

  describe('removePlayer', () => {
    it('should remove the player', () => {
      const s = createServer();

      s.addPlayer('007');

      expect(s.removePlayer('007').id).to.equal('007');
    });
  });
});
