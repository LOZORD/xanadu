import { parseArgs, startServer } from './main';
import { expect } from 'chai';
import { createDefaultWinstonLogger } from './logger';

describe('Main (Game Runner)', () => {
  describe('parseArgs', () => {
    context('without arguments', () => {
      it('should use the defaults when `--with-defaults` is used', () => {
        expect(parseArgs([ '--with-defaults' ])).to.eql({
          maxPlayers: 8,
          debug: false,
          port: 0,
          seed: 1234,
          allowRemoteConnections: false
        });
      });
      it('should be "incomplete" without `--with-defaults`', () => {
        expect(parseArgs([])).to.eql({
          maxPlayers: NaN,
          debug: false,
          port: NaN,
          seed: NaN,
          allowRemoteConnections: false
        });
      });
    });
    context('with the debug flag', () => {
      it('should have `debug` as `true`', () => {
        expect(parseArgs([ '--debug' ]).debug).to.be.true;
      });
    });
    context('with the no-debug flag', () => {
      it('should have `debug` as `false`', () => {
        expect(parseArgs([ '--no-debug' ]).debug).to.be.false;
      });
    });
    context('with the port number provided', () => {
      it('should use the correct port number', () => {
        expect(parseArgs([ '--port', '3456' ]).port).to.equal(3456);
      });
      it('should be the default port if the port number is invalid', () => {
        [ 0 - 1, 65535 + 1 ].forEach(portNum => {
          expect(parseArgs([ '--port', portNum.toString() ]).port).to.be.NaN;
        });
      });
    });
    context('with `maxPlayers` provided', () => {
      it('should use the number if valid', () => {
        expect(parseArgs([ '--maxPlayers', '16' ]).maxPlayers).to.equal(16);
      });
      it('should use the default number if provided number is invalid', () => {
        expect(parseArgs([ '--maxPlayers', '-789' ]).maxPlayers).to.be.NaN;
      });
    });
    context('with `seed` provided', () => {
      it('should use the seed number', () => {
        expect(parseArgs([ '--seed', '7007' ]).seed).to.equal(7007);
      });
    });
    context('with `allowRemoteConnections` provided', () => {
      it('should have allowRemoteConnections as true', () => {
        expect(parseArgs([ '--allowRemoteConnections' ]).allowRemoteConnections).to.be.true;
      });
    });
  });
  describe('startServer', () => {

    context('when the given args are invalid', () => {
      it('should report an insufficient number of players', (done) => {
        const parsedArgs = parseArgs([
          '--maxPlayers', '1',
          '--seed', '2112',
          '--port', '4003',
          '--no-debug'
        ]);

        startServer(parsedArgs, createDefaultWinstonLogger()).catch((error: Error) => {
          expect(error.message).to.include('maxPlayers should be a number greater than 1');
          done();
        });
      });
      it('should report a bad port number', (done) => {
        const parsedArgs = parseArgs([
          '--port', '-2345',
          '--maxPlayers', '16',
          '--seed', '42',
          '--no-debug'
        ]);

        startServer(parsedArgs, createDefaultWinstonLogger()).catch((error: Error) => {
          expect(error.message).to.include('port should be a number between 0 and 65535');
          done();
        });
      });
      it('should report a bad seed argument type', (done) => {
        const parsedArgs = parseArgs([
          '--seed', 'foobar',
          '--maxPlayers', '8',
          '--port', '3010',
          '--debug'
        ]);

        startServer(parsedArgs, createDefaultWinstonLogger()).catch((error: Error) => {
          expect(error.message).to.include('seed should be a number');
          done();
        });
      });
    });

    // the default args from `parseArgs` using `--with-defaults` are valid
    context('when the given args are valid', () => {
      it('should create and start a server');
      // TODO: is it bad to allow remote connections during testing?
      it('should allow remote connections if arg is given');
      it('should use localhost by default');
    });
  });
});
