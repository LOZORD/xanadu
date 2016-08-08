import * as _ from 'lodash';
import { expect } from 'chai';

import Server from './server';

describe('Server', () => {
  // turn off console.log for this test suite
  // FIXME: this should not be done, as mocha uses console.log + console.error
  before(function() {
    this.log = console.log;
    console.log = _.noop;
  });

  after(function() {
    console.log = this.log;
  });

  describe('constructor', () => {
    it('should have respect default arguments', () => {
      const s = new Server();

      expect(s.port).to.equal(3000);
      expect(s.maxPlayers).to.equal(8);
      // should set up the debug server by default
      expect(s.debugNS).to.be.ok;
    });
  });

  describe('start', () => {
    before(function() {
      this.server = new Server();
    });
    after(function() {
      return this.server.stop();
    });
    // it('should run correctly', function(done) {
    //   const startServer = () => {
    //     this.server.start().then(() => {
    //       done();
    //     });
    //   };
    //   expect(startServer).not.to.throw(Error);
    // });
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
        const s = new Server();

        expect(s.getSocket('007')).to.be.undefined;
      });
    });
  });

  describe('addPlayer', () => {
    it('should add the player', () => {
      const s = new Server();

      s.addPlayer('007');

      expect(s.currentContext.getPlayer('007')).to.be.ok;
    });
  });

  describe('removePlayer', () => {
    it('should remove the player', () => {
      const s = new Server();

      s.addPlayer('007');

      expect(s.removePlayer('007').id).to.equal('007');
    });
  });
});
