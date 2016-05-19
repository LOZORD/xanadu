import Http from 'http';
import Express from 'express';
import Path from 'path';
import IoFunction from 'socket.io';

export default class Server {
  constructor(kwargs = {}) {
    this.expressApp = Express();
    this.httpServer = Http.Server(this.expressApp);
    this.io         = IoFunction(this.httpServer);
    this.port       = kwargs.port || 3000;
    this.sockets    = kwargs.sockets || [];

    this.createServer();

    this.gameNS = this.io.of('/game');

    this.debug = kwargs.debug || true;

    if (this.debug) {
      this.debugNS = this.io.of('/debug');
    }

    this.ns         = kwargs.ns || '/';
    this.seed       = kwargs.seed || Date.now();
    this.sockets = [];
  }
  createServer() {
    const PATHS = {
      CLIENT: Path.join(__dirname, '..', 'client'),
      NODE_MODULES: Path.join(__dirname, '..', '..', 'node_modules')
    };
    PATHS.JQUERY = Path.join(PATHS.NODE_MODULES, 'jquery', 'dist');
    PATHS.BOOTSTRAP = Path.join(PATHS.NODE_MODULES, 'bootstrap', 'dist');

    this.expressApp.use(Express.static(PATHS.CLIENT));
    this.expressApp.use('/jquery', Express.static(PATHS.JQUERY));
    this.expressApp.use('/bootstrap', Express.static(PATHS.BOOTSTRAP));

    this.httpServer.listen(this.port, () => {
      console.log(`XANADU SERVER listening on port ${ this.port }`);
    });
  }
  acceptSocket(socket, game) {
    console.log(`Server accepted socket ${ socket.id }`);
    this.sockets.push(socket);
    socket.on('message', (messageObj) => {
      console.log(`Socket ${ socket.id }: ${ messageObj }`);
      game.handleMessage(messageObj, socket.id);
    });
  }
  rejectSocket(socket) {
    console.log(`socket ${ socket.id } rejected -- game full`);
    socket.emit('rejected-from-room');
  }
}
