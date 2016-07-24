import Server from './server/server';

type CommandLineArgs = {
  maxPlayers?: number,
  debug?: boolean,
  port?: number,
  seed?: number
};

function parseArgs(argv: string[]): CommandLineArgs {
  let args = {
    maxPlayers: undefined,
    debug: undefined,
    port: undefined,
    seed: undefined
  };
  let i = 2;
  while (i < argv.length) {
    if (argv[i] === '--no-debug') {
      args.debug = false;
      i++;
    } else if (argv[i] === '--debug') {
      args.debug = true;
      i++;
    } else if (argv[i] === '--port') {
      let port = parseInt(argv[i + 1], 10);
      if (port < 1 || port > 65535) {
        port = NaN;
      }
      args.port = port;
      i += 2;
    } else if (argv[i] === '--maxPlayers') {
      let maxPlayers = parseInt(argv[i + 1], 10);
      if (maxPlayers < 2) {
        maxPlayers = NaN;
      }
      args.maxPlayers = maxPlayers;
      i += 2;
    } else if (argv[i] === '--seed') {
      args.seed = parseInt(argv[i + 1], 10);
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

function startServer() {
  const { maxPlayers, debug, port, seed } = parseArgs(process.argv);
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
  }
}

startServer();
