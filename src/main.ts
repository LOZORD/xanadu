import Server from './server/server';
import { Promise } from 'es6-promise';

export type CommandLineArgs = {
  maxPlayers?: number,
  debug?: boolean,
  port?: number,
  seed?: number
};

export function parseArgs(givenArgs: string[]): CommandLineArgs {
  let args = {
    maxPlayers: undefined,
    debug: undefined,
    port: undefined,
    seed: undefined
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
      if (port < 1 || port > 65535) {
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
    }
  }
  return {
    maxPlayers: args.maxPlayers || 8,
    debug: args.debug || false,
    port: args.port || 3000,
    seed: args.seed || 1234
  };
}

export function startServer(args: CommandLineArgs): Promise<Server> {
  const { maxPlayers, debug, port, seed } = args;
  if (isNaN(maxPlayers) || isNaN(port) || isNaN(seed)) {
    console.error('Invalid arguments:');
    if (isNaN(maxPlayers)) {
      console.error('- maxPlayers should be a number greater than 1');
    }
    if (isNaN(port)) {
      console.error('- port should be a number between 1 and 65535');
    }
    if (isNaN(seed)) {
      console.error('- seed should be a number');
    }
  } else {
    const server = new Server(maxPlayers, debug, port, seed.toString());

    return server.start();
  }
}

function isBeingRun(): boolean {
  return !module.parent;
}

if (isBeingRun()) {
  const args = parseArgs(process.argv.slice(2));
  startServer(args);
}
