import * as _ from 'lodash';
import { expect } from 'chai';
import Server from './server';
import * as Winston from 'winston';
import * as ClientSocket from 'socket.io-client';
import { Promise } from 'es6-promise';

type ClientSocket = SocketIOClient.Socket;
const FIRST_FREE_PORT = 0;

describe('Server', () => {
  const createServer = (debug = false): Server => {
    // TODO: create own Winston instance
    Winston.level = 'error';
    return new Server(8, Date.now().toString(), debug, Winston);
  };

  const createClient =
    (port: number, socketNamespace: string, options: SocketIOClient.ConnectOpts = {}):
    //(port: number, socketNamespace: string, options: SocketIOClient.ConnectOpts = { forceNew: true }):
    SocketIOClient.Socket => {
      if (socketNamespace[ 0 ] !== '/') {
        socketNamespace = '/' + socketNamespace;
      }

      //(options as any)['force new connection'] = true;

      return ClientSocket.connect(`http://localhost:${port}${socketNamespace}`, options);
    };

  const shutdownSocket = (socket: ClientSocket): void => {
    socket.disconnect();
    socket.close();
  };

  type ServerAndClients = {
    server: Server,
    gameClients: ClientSocket[]
    debugClients: ClientSocket[];
  };

  // TODO: remove this function (it does TOO much)
  const createServerAndClients =
    (numGameClients = 1, numDebugClients = 0, port = FIRST_FREE_PORT): Promise<ServerAndClients> => {
      const serverPromise = createServer(numDebugClients > 0).start(port);
      const clientPromises = _.times(numGameClients + numDebugClients, (n) => {
        return new Promise((resolve, reject) => {
          serverPromise.then(server => {
            const clientNamespace = n < numGameClients ? '/game' : '/debug';
            resolve(createClient(server.address.port, clientNamespace));
          });
        });
      });

      const serverAndClientsPromise = new Promise<ServerAndClients>((resolve, reject) => {
        Promise.all(clientPromises.concat(serverPromise)).then(values => {
          const server = _.last(values) as Server;
          const clients = _.initial(values) as ClientSocket[];
          resolve({
            server: server,
            gameClients: _.filter(clients, client => client.nsp === '/game'),
            debugClients: _.filter(clients, client => client.nsp === '/debug')
          });
        });
      });

      return serverAndClientsPromise;
    };

  const shutdownServerAndClients = (serverAndClients: ServerAndClients) => {
    _.concat(serverAndClients.gameClients, serverAndClients.debugClients)
      .forEach(clientSocket => {
        //console.log(`shut down socket ${ clientSocket.id }`);
        shutdownSocket(clientSocket);
      });

    serverAndClients.server.stop();
  };

  describe('getSocket', () => {
    before(function () {
      this.server = createServer();

      this.serverPromise = (this.server as Server).start(FIRST_FREE_PORT);

      this.clientPromise = new Promise<SocketIOClient.Socket>((resolve, reject) => {
        this.serverPromise.then(server => {
          const serverPort = server.httpServer.address().port;

          resolve(createClient(serverPort, '/game'));
        });
      });
    });
    after(function () {
      (this.clientPromise as Promise<ClientSocket>).then(client => {
        shutdownSocket(client);
      });
      (this.serverPromise as Promise<Server>).then(server => {
        server.stop();
      });
    });
    context('when the socket is present', function () {
      it('should return the socket', function () {
        return (this.serverPromise as Promise<Server>).then(server => {
          (this.clientPromise as Promise<ClientSocket>).then(client => {
            expect(server.getSocket(client.id)).to.be.ok;
          });
        });
      });
    });
    context('when the socket is NOT present', function () {
      it('should return undefined', function () {
        return (this.serverPromise as Promise<Server>).then(server => {
          expect(server.getSocket('007')).to.be.undefined;
        });
      });
    });
  });
  describe.skip('rejectSocket2', function () {
    this.slow(150);

    before(function () {
      Winston.level = 'error';
      this.server = new Server(1, Date.now().toString(), false, Winston);

      this.serverPromise = (this.server as Server).start(0);

      this.serverPromise.then((server: Server) => {
        const port = server.address.port;
        this.gameClient = createClient(port, '/game');
      });
    });
    after(function (done) {
      shutdownSocket(this.gameClient);
      this.serverPromise.then((server: Server) => {
        server.stop();
        done();
      });
    });
    it('should emit a `rejected-from-room` message to the client', function (done) {
      (this.serverPromise as Promise<Server>).then(server => {
        this.newClient = createClient(server.address.port, '/game');

        const donePromise = new Promise((resolve, reject) => {
          this.newClient.on('rejected-from-room', () => resolve(true));
        });

        expect(server.getSocket(this.newClient.id)).to.be.undefined;

        donePromise.then(sawRejection => {
          expect(sawRejection).to.be.true;
          done();
        });
      });
    });
  });
  describe.skip('rejectSocket1', function () {
    this.slow(150);
    before(function () {
      this.serverAndClientsPromise = createServerAndClients(8, 0, 0);

      this.serverAndClientsPromise.then(({server}) => {
        expect(server.sockets.length).to.equal(server.maxPlayers);
      });
    });
    after(function () {
      shutdownSocket(this.newClient);
      return this.serverAndClientsPromise.then(shutdownServerAndClients);
    });
    it('should emit a `rejected-from-room` message to the client', function (done) {
      (this.serverAndClientsPromise as Promise<ServerAndClients>).then(serverAndClients => {
        const server = serverAndClients.server;

        this.newClient = createClient(server.address.port, '/game');

        const donePromise = new Promise((resolve, reject) => {
          this.newClient.on('rejected-from-room', () => resolve(true));
        });

        expect(server.getSocket(this.newClient.id)).to.be.undefined;

        donePromise.then(sawRejection => {
          expect(sawRejection).to.be.true;
          done();
        });
      });
    });
  });
  // FIXME
  describe.skip('Debug Mode', function () {
    before(function () {
      this.serverPromise = createServer(true).start(FIRST_FREE_PORT);

      this.serverPromise.then((server: Server) => {
        const port = server.address.port;
        this.gameClient = createClient(port, '/game');
        this.debugClient = createClient(port, '/debug');
      });
    });
    after(function () {
      shutdownSocket(this.debugClient);
      shutdownSocket(this.gameClient);

      return (this.serverPromise as Promise<Server>).then(server => {
        server.stop();
      });
    });
    it('should have set up a debug namespace', function () {
      return (this.serverPromise as Promise<Server>).then(server => {
        expect(server.debugNS).to.be.ok;
      });
    });
    it('should response to `get` events from the client');
    it('should respond with `debug-update` events');
  });
});
