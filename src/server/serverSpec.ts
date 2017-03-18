import { expect } from 'chai';
import * as Sinon from 'sinon';
import Server from './server';
import * as Socket from '../socket';
import { createDefaultWinstonLogger } from '../logger';
import * as Messaging from '../game/messaging';
import Lobby from '../context/lobby';
import Game from '../context/game';
import * as _ from 'lodash';
import * as Player from '../game/player';

type MockServer = Server<Socket.MockServerSocketServer>;
function createTestServer(maxPlayers = 3): MockServer {
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
    let server: MockServer;
    let socket: Socket.Socket;
    const socketID = '007';
    const badID = '700';
    before(() => {
      server = createTestServer();
      return server.start().then(() => {
        socket = server.io.createAndHandleSocket(socketID, Server.GAME_NAMESPACE);
      });
    });
    after(() => {
      return server.stop();
    });
    context('when the socket is present', () => {
      it('should return the socket', () => {
        expect(server.getSocket(socketID)).to.be.ok;
      });
    });
    context('when the socket is NOT present', () => {
      it('should return undefined', () => {
        expect(server.getSocket(badID)).to.be.undefined;
      });
    });
  });

  describe('rejectSocket', () => {
    let server: MockServer;
    let socket: Socket.Socket;
    const socketID = '007';
    before(() => {
      // Don't let anyone join the game!
      server = createTestServer(0);
      server.start().then(() => {
        socket = server.io.createAndHandleSocket(socketID, Server.GAME_NAMESPACE);
      });
    });
    after(() => {
      return server.stop();
    });
    it('should emit a `rejected-from-room` event', () => {
      const allEvents = (socket as Socket.MockServerSocket).allEvents();
      expect(allEvents).to.contain('rejected-from-room');
    });
  });

  describe('start', () => {
    it('should use the localhost hostname by default', () => {
      const server = createTestServer();
      return server.start().then(() => {
        expect(server.listening).to.be.true;
        expect(server.address.address).to.eql(Server.LOCALHOST_ADDRESS);
        return server.stop();
      });
    });
    it('should use the hostname argument if it given', () => {
      const server = createTestServer();
      return server.start(0, Server.REMOTE_CONNECTION_ADDRESS).then(() => {
        expect(server.listening).to.be.true;
        expect(server.address.address).to.eql(Server.REMOTE_CONNECTION_ADDRESS);
        return server.stop();
      });
    });
  });

  describe('stop', () => {
    let server: MockServer;
    let socket: Socket.Socket;
    before(() => {
      server = createTestServer();
      return server.start(0).then(() => {
        socket = server.io.createAndHandleSocket('007', Server.GAME_NAMESPACE);
        expect(server.listening).to.be.true;
        return server.stop();
      });
    });
    after(() => {
      return server.stop();
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
      expect(server.listening).to.be.false;
    });
  });

  describe('handleConnection', () => {
    context('when the current context is accepting players', () => {
      let server: MockServer;
      let socket: Socket.Socket;
      let acceptSpy: Sinon.SinonSpy;
      before(() => {
        acceptSpy = Sinon.spy(Server.prototype, 'acceptSocket');
        server = createTestServer();
        return server.start(0).then(() => {
          socket = server.io.createAndHandleSocket('007', Server.GAME_NAMESPACE);
          return server;
        });
      });
      after(() => {
        return server.stop();
      });
      it('should accept the socket', () => {
        expect(acceptSpy.called).to.be.true;
        const socketArg = acceptSpy.firstCall.args[0] as Socket.Socket;
        expect(socketArg.id).to.eql('007');
      });
    });
    context('when the current context is NOT accepting players', () => {
      let server: MockServer;
      let socket1: Socket.Socket;
      let socket2: Socket.Socket;
      let rejectSpy: Sinon.SinonSpy;
      before(() => {
        rejectSpy = Sinon.spy(Server.prototype, 'rejectSocket');
        // Only allow 1 player!
        server = createTestServer(1);
        return server.start().then(() => {
          socket1 = server.io.createAndHandleSocket('007', Server.GAME_NAMESPACE);
          socket2 = server.io.createAndHandleSocket('008', Server.GAME_NAMESPACE);
          return server;
        });
      });
      after(() => {
        return server.stop();
      });
      it('should reject the socket', () => {
        expect(rejectSpy.called).to.be.true;
        const socketArg = rejectSpy.firstCall.args[0] as Socket.Socket;
        expect(socketArg.id).to.eql('008');
      });
    });
  });

  describe('handleDisconnection', () => {
    let server: MockServer;
    let socket1: Socket.MockServerSocket;
    let socket2: Socket.MockServerSocket;
    let sendMessageSpy: Sinon.SinonSpy;
    before(() => {
      server = createTestServer(2);
      return server.start(0).then(() => {
        sendMessageSpy = Sinon.spy(server, 'sendMessage');
        socket1 = server.io.createAndHandleSocket('abc', Server.GAME_NAMESPACE);
        socket2 = server.io.createAndHandleSocket('def', Server.GAME_NAMESPACE);
        // Then name the players.
        server.handleMessage({
          player: server.currentContext.getPlayer('abc')!,
          content: 'Alice',
          timestamp: 1234
        }, socket1);

        server.handleMessage({
          player: server.currentContext.getPlayer('def')!,
          content: 'Dougie',
          timestamp: 5678
        }, socket2);
      }).then(() => {
        server.handleDisconnection(socket2);
      });
    });
    after(() => {
      return server.stop();
    });
    it('should remove the socket\'s player from the current context', () => {
      expect(server.currentContext.hasPlayer('abc')).to.be.true;
      expect(server.currentContext.hasPlayer('def')).to.be.false;
    });
    it('should send the updated roster', () => {
      const events = socket1.allEvents();
      expect(events).to.contain('roster');
    });
    it('should send a message to other players if the player was named', () => {
      const sentMessage = sendMessageSpy.args.some(arg => {
        const message: Messaging.Message = arg[0];
        return message.content.indexOf('Dougie has left the game') >= 0;
      });
      expect(sentMessage).to.be.true;
    });
    it('should start the game if everyone else is ready');
  });

  describe('sendDetails', () => {
    let server: MockServer;
    let socket1: Socket.MockServerSocket;
    let socket2: Socket.MockServerSocket;
    before(() => {
      server = createTestServer(4);
      return server.start().then(() => {
        socket1 = server.io.createAndHandleSocket('123', Server.GAME_NAMESPACE);
        socket2 = server.io.createAndHandleSocket('456', Server.GAME_NAMESPACE);
        return server;
      });
    });
    after(() => {
      return server.stop();
    });
    context('when the current context is `Lobby`', () => {
      before(() => {
        expect(server.currentContext).to.be.an.instanceOf(Lobby);
      });
      it('should not send details', () => {
        server.sendDetails();
        [socket1, socket2].forEach(socket => {
          expect(socket.allEvents()).not.to.contain('details');
        });
      });
    });
    context('when the current context is `Game`', () => {
      before(() => {
        server.currentContext.getPlayer(socket1.id)!.name = 'SocketOne';
        server.currentContext.getPlayer(socket2.id)!.name = 'SocketTwo';
        server.changeContext();
        expect(server.currentContext).to.be.an.instanceOf(Game);
      });
      it('should send each player their details', () => {
        server.sendDetails();
        [socket1, socket2].forEach(socket => {
          expect(socket.allEvents()).contains('details');
          const sentDetails = _.find(socket.emittedData, ({ event }) => event === 'details')!;
          expect(sentDetails).to.be.ok;
          const player = server.currentContext.getPlayer(socket.id) as Player.GamePlayer;
          expect(player).to.be.ok;
          expect(sentDetails.data).to.eql(Player.playerDetails(player));
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

  describe('changeContext', () => {
    context('when the current context is `Lobby`', () => {
      let server: MockServer;
      let socket: Socket.MockServerSocket;

      before(() => {
        server = createTestServer();
        return server.start().then(() => {
          socket = server.io.createAndHandleSocket('007', Server.GAME_NAMESPACE);
          expect(server.currentContext).to.be.an.instanceOf(Lobby);
          expect(server.getCurrentPlayers()).to.have.lengthOf(1);
          const player = server.getCurrentPlayers()[0];
          player.name = 'James_Bond';
          server.changeContext();
        });
      });

      after(() => {
        return server.stop();
      });

      it('should set the context to `Game`', () => {
        expect(server.currentContext).to.be.an.instanceOf(Game);
      });

      it('should have emitted a `context-change` event with `Game`', () => {
        expect(socket.allEvents()).to.contain('context-change');
        // Get the most recent data.
        const data = _.findLast(socket.emittedData, event => event.event === 'context-change');
        expect(data).to.be.ok;
        expect(data!.data).to.eql('Game');
      });
    });

    context('when the current context is `Game`', () => {
      let server: MockServer;
      let socket: Socket.MockServerSocket;

      before(() => {
        server = createTestServer();
        return server.start().then(() => {
          socket = server.io.createAndHandleSocket('007', Server.GAME_NAMESPACE);
          expect(server.currentContext).to.be.an.instanceOf(Lobby);
          expect(server.getCurrentPlayers()).to.have.lengthOf(1);
          const player = server.getCurrentPlayers()[0];
          player.name = 'James_Bond';
          server.changeContext();
          expect(server.currentContext).to.be.an.instanceOf(Game);
          server.changeContext();
          expect(server.currentContext).to.be.an.instanceOf(Lobby);
        });
      });

      after(() => {
        return server.stop();
      });

      it('should set the context to `Lobby`', () => {
        expect(server.currentContext).to.be.an.instanceOf(Lobby);
      });

      it('should have emitted a `context-change` event with `Game`', () => {
        expect(socket.allEvents()).to.contain('context-change');
        // Get the most recent data.
        const data = _.findLast(socket.emittedData, event => event.event === 'context-change');
        expect(data).to.be.ok;
        expect(data!.data).to.eql('Lobby');
      });
    });
  });
});
