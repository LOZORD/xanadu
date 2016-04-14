import process from 'process';
import Game from './server/game';

let die = function(msg) {
  console.error(msg);
  process.exit(1);
};

let parseArgs = function(argv) {
  let args = {};
  let i = 2; // skip node and filename
  while (i < argv.length) {
    if (argv[i] == '--port') {
      let port = parseInt(argv[i+1]);
      if (isNaN(port) || port < 1 || port > 65535) {
        die(`Invalid port "${ argv[i+1] }"`);
      } else {
        args.port = port;
      }
      i += 2;
    } else if (argv[i] == '--ns') {
      // Not supported
      die('Unsupported argument --ns');
    } else if (argv[i] == '--maxPlayers') {
      let maxPlayers = parseInt(argv[i+1]);
      if (isNaN(maxPlayers) || maxPlayers < 2) {
        die(`Invalid maxPlayers "${ argv[i+1] }"`);
      } else {
        args.maxPlayers = maxPlayers;
      }
    } else if (argv[i] == '--players') {
      // Not supported
      die('Unsupported argument --player');
    } else if (argv[i] == '--seed') {
      let seed = parseInt(argv[i+1]);
      if (isNaN(seed)) {
        die(`Invalid seed "${ argv[i+1] }"`);
      } else {
        args.seed = seed;
      }
      i += 2;
    } else {
      die(`Unexpected arg "${ argv[i] }"`);
    }
  }
  return args;
};

let args = parseArgs(process.argv);

(new Game(args));
