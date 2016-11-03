import { expect } from 'chai';
import Server from './server';
import { createDefaultWinstonLogger } from '../logger';
import * as ClientSocket from 'socket.io-client';
import { Promise } from 'es6-promise';

type ClientSocket = SocketIOClient.Socket;

describe('Server', () => {
  function createClient(serverPromise: Promise<Server>, nsp: string): Promise<ClientSocket> {
    return new Promise<ClientSocket>((resolve, reject) => {
      serverPromise.then(server => {
        const uri = `http://localhost:${server.address.port}${nsp}`;
        resolve(ClientSocket.connect(uri, {
          forceNew: true
        }));

        return server;
      });
    });
  }

  function shutdownSocket(socket: ClientSocket): void {
    socket.disconnect();
    socket.close();
  }

  before(function () {
    const winson = createDefaultWinstonLogger('error');
    const s = new Server(3, Date.now(), true, winson);

    // test the server on the first free port
    this.serverPromise = s.start(0);

    this.gameClients = [
      createClient(this.serverPromise, '/game'),
      createClient(this.serverPromise, '/game'),
      createClient(this.serverPromise, '/game')
    ];

    this.debugClient = createClient(this.serverPromise, '/debug');
  });
  after(function () {
    this.debugClient.then(socket => shutdownSocket(socket));
    this.gameClients.forEach(socketPromise => socketPromise.then(socket => {
      shutdownSocket(socket);
    }));

    (this.serverPromise as Promise<Server>).then(server => {
      server.stop();
    });
  });

  describe('getSocket', function () {
    context('when the socket is present', function () {
      it('should return the socket', function () {
        return (this.serverPromise as Promise<Server>).then(server => {
          const firstGameClientPromise = this.gameClients[ 0 ];

          (firstGameClientPromise as Promise<ClientSocket>).then(client => {
            expect(server.getSocket(client.id)).to.be.ok;
            return client;
          });

          return server;
        });
      });
    });
    context('when the socket is NOT present', function () {
      it('should return undefined', function () {
        return (this.serverPromise as Promise<Server>).then(server => {
          expect(server.getSocket('007')).to.be.undefined;
          return server;
        });
      });
    });
  });
  describe('rejectSocket', function () {
    type SocketPromiseAndResult = {
      socketPromise: Promise<ClientSocket>,
      result: string
    };

    before(function () {
      this.serverPromise.then(server => {
        expect(server.maxPlayers).to.equal(this.gameClients.length);

        return server;
      });

      this.donePromise = new Promise<SocketPromiseAndResult>((resolve) => {
        const newClient = createClient(this.serverPromise, '/game');

        newClient.then(socket => {
          socket.on('rejected-from-room', () => {
            resolve({
              socketPromise: newClient,
              result: 'GOT EVENT!'
            });
          });

          return socket;
        });
      });

      return this.donePromise;
    });
    after(function () {
      return (this.donePromise as Promise<SocketPromiseAndResult>).then(values => {
        values.socketPromise.then(socket => {
          shutdownSocket(socket);
          return socket;
        });

        return values;
      });
    });
    it('should emit a `rejected-from-room` event', function () {
      return (this.donePromise as Promise<SocketPromiseAndResult>).then(values => {
        expect(values.result).to.equal('GOT EVENT!');
        return values;
      });
    });
  });
  describe('start', function () {
    it('should use the localhost hostname by default', function () {
      return (this.serverPromise as Promise<Server>).then(server => {
        expect(server.address.address).to.eql(server.LOCALHOST_ADDRESS);
        return server;
      });
    });
    // TODO: is it bad to test with 0.0.0.0?
    // should another address be used instead?
    it('should use the hostname argument if it is given');
  });
});
