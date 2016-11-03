import Server from './server/server';
import { Promise } from 'es6-promise';
import { Logger, createDefaultWinstonLogger } from './logger';

export type CommandLineArgs = {
  maxPlayers: number,
  debug: boolean,
  port: number,
  seed: number,
  allowRemoteConnections: boolean
};

export function parseArgs(givenArgs: string[]): CommandLineArgs {
  let args = {
    maxPlayers: NaN,
    debug: false,
    port: NaN,
    seed: NaN,
    allowRemoteConnections: false
  };

  let i = 0;
  while (i < givenArgs.length) {
    if (givenArgs[ i ] === '--no-debug') {
      args.debug = false;
      i++;
    } else if (givenArgs[ i ] === '--debug') {
      args.debug = true;
      i++;
    } else if (givenArgs[ i ] === '--port') {
      let port = parseInt(givenArgs[ i + 1 ], 10);
      if (port < 0 || port > 65535) {
        port = NaN;
      }
      args.port = port;
      i += 2;
    } else if (givenArgs[ i ] === '--maxPlayers') {
      let maxPlayers = parseInt(givenArgs[ i + 1 ], 10);
      if (maxPlayers < 2) {
        maxPlayers = NaN;
      }
      args.maxPlayers = maxPlayers;
      i += 2;
    } else if (givenArgs[ i ] === '--seed') {
      args.seed = parseInt(givenArgs[ i + 1 ], 10);
      i += 2;
    } else if (givenArgs[ i ] === '--allowRemoteConnections') {
      args.allowRemoteConnections = true;
      i++;
    } else {
      // continue through...
      i++;
    }
  }

  if (givenArgs.indexOf('--with-defaults') > -1) {
    return {
      maxPlayers: args.maxPlayers || 8,
      debug: args.debug || false,
      port: args.port || 0,
      // TODO: eventually change from `1234` to `Date.now()` for launch
      seed: args.seed || 1234,
      allowRemoteConnections: args.allowRemoteConnections || false
    };
  } else {
    return args;
  }
}

export function startServer(args: CommandLineArgs, logger: Logger): Promise<Server> {
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
    const server = new Server(maxPlayers, seed, debug, logger);

    // localhost <-> no remote connections
    let hostname: string;

    if (args.allowRemoteConnections) {
      hostname = server.REMOTE_CONNECTION_ADDRESS;
    } else {
      hostname = server.LOCALHOST_ADDRESS;
    }

    return server.start(port, hostname);
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

  serverPromise.then((server: Server) => {
    server.logger.log('info', `XANADU SERVER LISTENING ON PORT: ${server.address.port}`);
  }, (error: Error) => {
    winston.error(error.message);
    process.exit(1);
  });

  // const endMain = (): void => {
  //   serverPromise.then((server: Server) => {
  //     server.logger.log('info', 'STOPPING XANADU SERVER...');

  //     const port = server.address.port;

  //     server.stop().then((stoppedServer) => {
  //       stoppedServer.logger.log('info', `XANADU SERVER STOPPED (PORT ${port})`);
  //       stoppedServer.logger.log('info', 'Exiting...');
  //       process.exit(0);
  //     });
  //     return server;
  //   });
  // };

  // FIXME: process.on('SIGINT', endMain);
}
