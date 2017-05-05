import { expect } from 'chai';
import * as Sinon from 'sinon';
import Server from './server';
import * as Socket from '../socket';
import { createDefaultWinstonLogger } from '../logger';
import * as Messaging from '../game/messaging';
import Lobby from '../context/lobby';
import Game from '../context/game';
import * as _ from 'lodash';
import * as shortid from 'shortid';
import * as Player from '../game/player';

type MockServer = Server<Socket.MockServerSocketServer>;
function createTestServer(maxPlayers = 3) {
  return new Server(
    Socket.mockSocketServerCreator,
    maxPlayers,
    Date.now(),
    true,
    createDefaultWinstonLogger('error')
  );
}

describe('Server', () => {
  describe('getSocket', () => {
    let serverPromise: Promise<MockServer>;
    let socket: Socket.Socket;
    const socketID = '007';
    const badID = '700';
    before(() => {
      const server = createTestServer();
      serverPromise = server.start(0).then(s => {
        socket = new Socket.MockServerSocket(socketID, '/game', s.io);
        s.acceptSocket(socket);
        return s;
      });
      return serverPromise;
    });
    after(() => {
      return serverPromise.then(s => {
        return s.stop();
      });
    });
    context('when the socket is present', () => {
      it('should return the socket', () => {
        return serverPromise.then(server => {
          expect(server.getSocket(socketID)).to.be.ok;
          return server;
        });
      });
    });
    context('when the socket is NOT present', () => {
      it('should return undefined', () => {
        return serverPromise.then(server => {
          expect(server.getSocket(badID)).to.be.undefined;
          return server;
        });
      });
    });
  });
  describe('rejectSocket', () => {
    let serverPromise: Promise<MockServer>;
    let socket: Socket.Socket;
    const socketID = '007';
    before(() => {
      const server = createTestServer();
      serverPromise = server.start(0).then(s => {
        socket = new Socket.MockServerSocket(socketID, '/game', s.io);
        s.rejectSocket(socket);
        return s;
      });
      return serverPromise;
    });
    after(() => {
      return serverPromise.then(s => {
        return s.stop();
      });
    });
    it('should emit a `rejected-from-room` event', () => {
      const allEvents = (socket as Socket.MockServerSocket).allEvents();
      expect(allEvents).to.contain('rejected-from-room');
    });
  });
  describe('start', () => {
    it('should use the localhost hostname by default', () => {
      return createTestServer().start(0).then(server => {
        expect(server.listening).to.be.true;
        expect(server.address.address).to.eql(Server.LOCALHOST_ADDRESS);
        return server.stop();
      });
    });
    it('should use the hostname argument if it given', () => {
      return createTestServer().start(0, Server.REMOTE_CONNECTION_ADDRESS).then(server => {
        expect(server.listening).to.be.true;
        expect(server.address.address).to.eql(Server.REMOTE_CONNECTION_ADDRESS);
        return server.stop();
      });
    });
  });
  describe('stop', () => {
    let serverPromise: Promise<MockServer>;
    let socket: Socket.Socket;
    before(() => {
      return serverPromise = createTestServer().start(0).then(server => {
        socket = new Socket.MockServerSocket('007', '/game', server.io as Socket.MockServerSocketServer);
        server.acceptSocket(socket);
        server.assignPlayer(socket, null);
        expect(server.listening).to.be.true;
        return server.stop();
      });
    });
    it('should send a `server-stopped` event', () => {
      const allEvents = (socket as Socket.MockServerSocket).allEvents();
      expect(allEvents).to.contain('server-stopped');
    });
    it('should disconnect all the sockets', () => {
      const wasDisconnected = (socket as Socket.MockServerSocket).isClosed;
      expect(wasDisconnected).to.be.true;
    });
    it('should stop the server from listening', () => {
      return serverPromise.then(server => {
        expect(server.listening).to.be.false;
      });
    });
  });
  describe('assignPlayer', () => {
    context('when two players with different persistentIds join', () => {
      let serverPromise: Promise<MockServer>;
      let socket1: Socket.MockServerSocket;
      let socket2: Socket.MockServerSocket;
      let createSpy: Sinon.SinonSpy;
      let generateSpy: Sinon.SinonStub;
      let i: number;
      before(() => {
        createSpy = Sinon.spy(Server.prototype, 'addPlayer');
        i = 1;
        generateSpy = Sinon.stub(shortid, 'generate').callsFake(() => `id${i++}`);
        return serverPromise = createTestServer().start(0).then(server => {
          socket1 = new Socket.MockServerSocket('001', '/game', server.io);
          socket2 = new Socket.MockServerSocket('002', '/game', server.io);
          server.sockets.push(socket1);
          server.sockets.push(socket2);
          server.assignPlayer(socket1, null);
          server.assignPlayer(socket2, 'id2');
          return server;
        });
      });
      after(() => {
        createSpy.restore();
        generateSpy.restore();
        return serverPromise.then(server => server.stop());
      });
      it('should accept both players', () => {
        expect(createSpy.calledWith(socket1.id)).to.be.true;
        expect(createSpy.calledWith(socket2.id)).to.be.true;
      });
    });
    context('when a player with a valid persistentId rejoins', () => {
      let serverPromise: Promise<MockServer>;
      let socket1: Socket.MockServerSocket;
      let socket2: Socket.MockServerSocket;
      let createSpy: Sinon.SinonSpy;
      let generateSpy: Sinon.SinonStub;
      let i: number;
      before(() => {
        createSpy = Sinon.spy(Server.prototype, 'addPlayer');
        i = 1;
        generateSpy = Sinon.stub(shortid, 'generate').callsFake(() => `id${i++}`);
        return serverPromise = createTestServer().start(0).then(server => {
          socket1 = new Socket.MockServerSocket('001', '/game', server.io);
          socket2 = new Socket.MockServerSocket('002', '/game', server.io);
          server.sockets.push(socket1);
          server.sockets.push(socket2);
          server.assignPlayer(socket1, null);
          server.assignPlayer(socket2, 'id1');
          return server;
        });
      });
      after(() => {
        createSpy.restore();
        generateSpy.restore();
        return serverPromise.then(server => server.stop());
      });
      it('should only accept the player once', () => {
        expect(createSpy.calledWith(socket1.id)).to.be.true;
        expect(createSpy.calledWith(socket2.id)).to.be.false;
      });
    });
  });
  describe('handleConnection', () => {
    context('when the current context is accepting players', () => {
      let serverPromise: Promise<MockServer>;
      let socket: Socket.MockServerSocket;
      let acceptSpy: Sinon.SinonSpy;
      before(() => {
        acceptSpy = Sinon.spy(Server.prototype, 'acceptSocket');
        return serverPromise = createTestServer().start(0).then(server => {
          socket = new Socket.MockServerSocket('007', '/game', server.io);
          server.handleConnection(socket);
          return server;
        });
      });
      after(() => {
        return serverPromise.then(server => server.stop());
      });
      it('should accept the socket', () => {
        expect(acceptSpy.called).to.be.true;
        const socketArg = acceptSpy.firstCall.args[ 0 ] as Socket.Socket;
        expect(socketArg.id).to.eql('007');
      });
    });
    context('when the current context is NOT accepting players', () => {
      let serverPromise: Promise<MockServer>;
      let socket1: Socket.MockServerSocket;
      let socket2: Socket.MockServerSocket;
      let rejectSpy: Sinon.SinonSpy;
      before(() => {
        rejectSpy = Sinon.spy(Server.prototype, 'rejectSocket');
        // Only allow 1 player!
        return serverPromise = createTestServer(1).start(0).then(server => {
          socket1 = new Socket.MockServerSocket('007', '/game', server.io);
          server.handleConnection(socket1);
          server.assignPlayer(socket1, null);
          socket2 = new Socket.MockServerSocket('008', '/game', server.io);
          server.handleConnection(socket2);
          return server;
        });
      });
      after(() => {
        return serverPromise.then(server => server.stop());
      });
      it('should reject the socket', () => {
        expect(rejectSpy.called).to.be.true;
        const socketArg = rejectSpy.firstCall.args[ 0 ] as Socket.Socket;
        expect(socketArg.id).to.eql('008');
      });
    });
  });
  describe('handleDisconnection', () => {
    let serverPromise: Promise<MockServer>;
    let socket1: Socket.MockServerSocket;
    let socket2: Socket.MockServerSocket;
    let sendMessageSpy: Sinon.SinonSpy;
    let clock: Sinon.SinonFakeTimers;
    before(() => {
      clock = Sinon.useFakeTimers();
      return serverPromise = createTestServer(2).start(0).then(server => {
        sendMessageSpy = Sinon.spy(server, 'sendMessage');
        socket1 = new Socket.MockServerSocket('abc', '/game', server.io);
        socket2 = new Socket.MockServerSocket('def', '/game', server.io);
        server.handleConnection(socket1);
        server.assignPlayer(socket1, null);
        server.handleConnection(socket2);
        server.assignPlayer(socket2, null);
        // Then name the players.
        server.handleMessage({
          player: server.currentContext.getPlayerBySocketId('abc') !,
          content: 'Alice',
          timestamp: 1234
        }, socket1);

        server.handleMessage({
          player: server.currentContext.getPlayerBySocketId('def') !,
          content: 'Dougie',
          timestamp: 5678
        }, socket2);

        return server;
      }).then(server => {
        server.handleDisconnection(socket2);
        clock.tick(Server.PLAYER_TIMEOUT + 100);
        return server;
      });
    });
    after(() => {
      clock.restore();
      return serverPromise.then(server => server.stop());
    });
    it('should remove the socket\'s player from the current context', () => {
      return serverPromise.then(server => {
        expect(server.currentContext.hasPlayerBySocketId('abc')).to.be.true;
        expect(server.currentContext.hasPlayerBySocketId('def')).to.be.false;
        return server;
      });
    });
    it('should send the updated roster', () => {
      const events = socket1.allEvents();
      expect(events).to.contain('roster');
    });
    it('should send a message to other players if the player was named', () => {
      const sentMessage = sendMessageSpy.args.some(arg => {
        const message: Messaging.Message = arg[ 0 ];
        return message.content.indexOf('Dougie has left the game') >= 0;
      });
      expect(sentMessage).to.be.true;
    });
    it('should start the game if everyone else is ready');
  });
  describe('sendDetails', () => {
    let serverPromise: Promise<MockServer>;
    let socket1: Socket.MockServerSocket;
    let socket2: Socket.MockServerSocket;
    before(() => {
      return serverPromise = createTestServer(4).start(0).then(server => {
        socket1 = new Socket.MockServerSocket('123', '/game', server.io);
        socket2 = new Socket.MockServerSocket('456', '/game', server.io);
        server.handleConnection(socket1);
        server.assignPlayer(socket1, null);
        server.handleConnection(socket2);
        server.assignPlayer(socket2, null);
        return server;
      });
    });
    after(() => {
      return serverPromise.then(server => server.stop());
    });
    context('when the current context is `Lobby`', () => {
      before(() => {
        return serverPromise.then(server => {
          expect(server.currentContext).to.be.an.instanceOf(Lobby);
          return server;
        });
      });
      it('should not send details', () => {
        return serverPromise.then(server => {
          server.sendDetails();
          [ socket1, socket2 ].forEach(socket => {
            expect(socket.allEvents()).not.to.contain('details');
          });
        });
      });
    });
    context('when the current context is `Game`', () => {
      before(() => {
        return serverPromise.then(server => {
          server.currentContext.getPlayerBySocketId(socket1.id) !.name = 'SocketOne';
          server.currentContext.getPlayerBySocketId(socket2.id) !.name = 'SocketTwo';
          server.changeContext();
          expect(server.currentContext).to.be.an.instanceOf(Game);
          return server;
        });
      });
      it('should send each player their details', () => {
        return serverPromise.then(server => {
          server.sendDetails();
          [ socket1, socket2 ].forEach(socket => {
            expect(socket.allEvents()).contains('details');
            const sentDetails = _.find(socket.emittedData, ({event}) => event === 'details') !;
            expect(sentDetails).to.be.ok;
            const player = server.currentContext.getPlayerBySocketId(socket.id) as Player.GamePlayer;
            expect(player).to.be.ok;
            expect(sentDetails.data).to.eql(Player.playerDetails(player));
          });
          return server;
        });
      });
    });
  });
  describe('createDebugServer', () => {
    it('should be tested!');
  });
  describe('handleMessage', () => {
    it('should be tested!');
  });
});
