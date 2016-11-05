import * as Main from './main';
import { expect } from 'chai';
import { createDefaultWinstonLogger } from './logger';
import * as Sinon from 'sinon';
import Server from './server/server';
import { cloneDeep } from 'lodash';

describe('Main (Game Runner)', () => {
  describe('parseArgs', () => {
    context('without arguments', () => {
      it('should use the defaults when `--with-defaults` is used', () => {
        expect(Main.parseArgs([ '--with-defaults' ])).to.eql({
          maxPlayers: 8,
          debug: false,
          port: 0,
          seed: 1234,
          allowRemoteConnections: false
        });
      });
      it('should be "incomplete" without `--with-defaults`', () => {
        expect(Main.parseArgs([])).to.eql({
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
        expect(Main.parseArgs([ '--debug' ]).debug).to.be.true;
      });
    });
    context('with the no-debug flag', () => {
      it('should have `debug` as `false`', () => {
        expect(Main.parseArgs([ '--no-debug' ]).debug).to.be.false;
      });
    });
    context('with the port number provided', () => {
      it('should use the correct port number', () => {
        expect(Main.parseArgs([ '--port', '3456' ]).port).to.equal(3456);
      });
      it('should be the default port if the port number is invalid', () => {
        [ 0 - 1, 65535 + 1 ].forEach(portNum => {
          expect(Main.parseArgs([ '--port', portNum.toString() ]).port).to.be.NaN;
        });
      });
    });
    context('with `maxPlayers` provided', () => {
      it('should use the number if valid', () => {
        expect(Main.parseArgs([ '--maxPlayers', '16' ]).maxPlayers).to.equal(16);
      });
      it('should use the default number if provided number is invalid', () => {
        expect(Main.parseArgs([ '--maxPlayers', '-789' ]).maxPlayers).to.be.NaN;
      });
    });
    context('with `seed` provided', () => {
      it('should use the seed number', () => {
        expect(Main.parseArgs([ '--seed', '7007' ]).seed).to.equal(7007);
      });
    });
    context('with `allowRemoteConnections` provided', () => {
      it('should have allowRemoteConnections as true', () => {
        expect(Main.parseArgs([ '--allowRemoteConnections' ]).allowRemoteConnections).to.be.true;
      });
    });
    context('with a combination of default and provided arguments', () => {
      it('should respect the provided arguments', () => {
        const expectedArgs: Main.CommandLineArgs = {
          seed: 777,
          port: 4567,
          maxPlayers: Main.DEFAULT_ARGS.maxPlayers,
          debug: Main.DEFAULT_ARGS.debug,
          allowRemoteConnections: false
        };

        expect(Main.parseArgs([
          '--seed', '777',
          '--port', '4567',
          '--with-defaults'
        ])).eql(expectedArgs);
      });
    });
  });
  describe('startServer', () => {

    context('when the given args are invalid', () => {
      it('should report an insufficient number of players', (done) => {
        const parsedArgs = Main.parseArgs([
          '--maxPlayers', '1',
          '--seed', '2112',
          '--port', '4003',
          '--no-debug'
        ]);

        Main.startServer(parsedArgs, createDefaultWinstonLogger()).catch((error: Error) => {
          expect(error.message).to.include('maxPlayers should be a number greater than 1');
          done();
        });
      });
      it('should report a bad port number', (done) => {
        const parsedArgs = Main.parseArgs([
          '--port', '-2345',
          '--maxPlayers', '16',
          '--seed', '42',
          '--no-debug'
        ]);

        Main.startServer(parsedArgs, createDefaultWinstonLogger()).catch((error: Error) => {
          expect(error.message).to.include('port should be a number between 0 and 65535');
          done();
        });
      });
      it('should report a bad seed argument type', (done) => {
        const parsedArgs = Main.parseArgs([
          '--seed', 'foobar',
          '--maxPlayers', '8',
          '--port', '3010',
          '--debug'
        ]);

        Main.startServer(parsedArgs, createDefaultWinstonLogger()).catch((error: Error) => {
          expect(error.message).to.include('seed should be a number');
          done();
        });
      });
    });

    context('when the given args are valid', () => {
      beforeEach(function () {
        // Don't actually let our servers listen
        this.createServerStub
          = Sinon.stub(Server.prototype, 'createServer', () => null);
        this.createDebugServerStub
          = Sinon.stub(Server.prototype, 'createDebugServer', () => null);
        this.startSpy
          = Sinon.spy(Server.prototype, 'start');
        this.logger = createDefaultWinstonLogger();
        this.defaultServerPromise = Main.startServer(Main.DEFAULT_ARGS, this.logger);
      });
      afterEach(function () {
        this.createServerStub.restore();
        this.createDebugServerStub.restore();
        (Server.prototype.start as Sinon.SinonSpy).restore();
      });
      it('should create and start a server', function () {
        // the default args from `parseArgs` using `--with-defaults` are valid
        return this.defaultServerPromise.then(server => {
          expect(server).to.be.ok;
          expect((this.startSpy as Sinon.SinonSpy).calledOnce).to.be.true;
          server.stop();
        });
      });
      it('should allow remote connections if arg is given', function () {
        const remoteConnArgs = cloneDeep(Main.DEFAULT_ARGS);
        remoteConnArgs.allowRemoteConnections = true;
        remoteConnArgs.port = 1337;

        const remoteConnServerPromise = Main.startServer(remoteConnArgs, this.logger);

        return remoteConnServerPromise.then((server: Server) => {
          expect(server).to.be.ok;

          const spy = this.startSpy as Sinon.SinonSpy;

          // the first call is for the defaultServerPromise
          const [ port, hostname ] = spy.secondCall.args;

          expect(port).to.eql(1337);
          expect(hostname).to.eql(server.REMOTE_CONNECTION_ADDRESS);

          server.stop();
        });
      });
      it('should use localhost by default', function () {
        return this.defaultServerPromise.then((server: Server) => {
          const hostname = (this.createServerStub as Sinon.SinonStub).firstCall.args[ 1 ];

          expect(hostname).to.eql(server.LOCALHOST_ADDRESS);

          server.stop();
        });
      });
    });
  });
});
