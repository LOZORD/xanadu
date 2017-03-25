import Server from './server/server';
import { Logger, createDefaultWinstonLogger } from './logger';
import { extendWith } from 'lodash';
import * as SocketIO from 'socket.io';

export type CommandLineArgs = {
  maxPlayers: number,
  debug: boolean,
  port: number,
  seed: number,
  allowRemoteConnections: boolean
};

// TODO: eventually change from `1234` to `Date.now()` for launch
export const DEFAULT_ARGS: CommandLineArgs = {
  maxPlayers: 8,
  debug: false,
  port: 0,
  seed: 1234,
  allowRemoteConnections: false
};

export function parseArgs(givenArgs: string[]): CommandLineArgs {
  let args: CommandLineArgs = {
    maxPlayers: NaN,
    debug: false,
    port: NaN,
    seed: NaN,
    allowRemoteConnections: false
  };

  let i = 0;
  while (i < givenArgs.length) {
    if (givenArgs[i] === '--no-debug') {
      args.debug = false;
      i++;
    } else if (givenArgs[i] === '--debug') {
      args.debug = true;
      i++;
    } else if (givenArgs[i] === '--port') {
      let port = parseInt(givenArgs[i + 1], 10);
      if (port < 0 || port > 65535) {
        port = NaN;
      }
      args.port = port;
      i += 2;
    } else if (givenArgs[i] === '--maxPlayers') {
      let maxPlayers = parseInt(givenArgs[i + 1], 10);
      if (maxPlayers < 2) {
        maxPlayers = NaN;
      }
      args.maxPlayers = maxPlayers;
      i += 2;
    } else if (givenArgs[i] === '--seed') {
      args.seed = parseInt(givenArgs[i + 1], 10);
      i += 2;
    } else if (givenArgs[i] === '--allowRemoteConnections') {
      args.allowRemoteConnections = true;
      i++;
    } else {
      // continue through...
      i++;
    }
  }

  if (givenArgs.indexOf('--with-defaults') > -1) {
    return extendWith({}, args, DEFAULT_ARGS, (oldValue, newValue) => {
      return isNaN(oldValue) ? newValue : oldValue;
    });
  } else {
    return args;
  }
}

export function startServer(args: CommandLineArgs, logger: Logger): Promise<Server<SocketIO.Server>> {
  const { maxPlayers, debug, port, seed } = args;
  if (isNaN(maxPlayers) || isNaN(port) || isNaN(seed)) {
    let errMsg = 'Invalid arguments (`--with-defaults` flag is suggested):\n';
    if (isNaN(maxPlayers)) {
      errMsg += '\t- maxPlayers should be a number greater than 1\n';
    }
    if (isNaN(port)) {
      errMsg += '\t- port should be a number between 0 and 65535\n';
    }
    if (isNaN(seed)) {
      errMsg += '\t- seed should be a number\n';
    }

    return Promise.reject(new Error(errMsg));
  } else {
    const server = new Server<SocketIO.Server>(SocketIO, maxPlayers, seed, debug, logger);

    // localhost <-> no remote connections
    let hostname: string;

    if (args.allowRemoteConnections) {
      hostname = Server.REMOTE_CONNECTION_ADDRESS;
    } else {
      hostname = Server.LOCALHOST_ADDRESS;
    }

    return server.start(port, hostname).then(() => server);
  }
}

function isBeingRun(): boolean {
  return !module.parent;
}

/* MAIN EXECUTABLE CODE */
if (isBeingRun()) {
  const args = parseArgs(process.argv.slice(2));

  const winston = createDefaultWinstonLogger();

  if (args.debug) {
    winston.level = 'debug';
  } else {
    winston.level = 'info';
  }

  const serverPromise = startServer(args, winston);

  serverPromise.then((server: Server<SocketIO.Server>) => {
    server.logger.log('info', `XANADU SERVER LISTENING ON PORT: ${server.address.port}`);
  }, (error: Error) => {
    winston.log('error', error.message);
    process.exit(1);
  });

  if (process.argv.some(arg => arg.indexOf('autokill') >= 0)) {
    console.log('AUTOKILLING IN 20 SECONDS!');
    setTimeout(() => {
      process.kill(process.pid, 'SIGINT');
    }, 20 * 1000);
  }

  process.on('SIGINT', () => {
    serverPromise.then(server => {
      const port = server.address.port;
      server.logger.log('debug', 'STOPPING XANADU SERVER...');
      return server.stop().then(() => {
        server.logger.log('info', `SERVER STOPPED! (PORT ${port})\nGoodbye!`);
      }, (error: Error) => {
        winston.log('error', error.message);
        process.exit(1);
      });
    }, error => {
      winston.log('error', error.message);
      process.exit(1);
    });
  });
}
