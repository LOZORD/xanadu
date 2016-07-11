import * as Server from './server/server';

function parseArgs(argv: string[]) {
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
            let port = parseInt(argv[i+1]);
            if (port < 1 || port > 65535) {
                port = NaN;
            }
            args.port = port;
            i += 2;
        } else if (argv[i] === '--maxPlayers') {
            let maxPlayers = parseInt(argv[i+1]);
            if (maxPlayers < 2) {
                maxPlayers = NaN;
            }
            args.maxPlayers = maxPlayers;
            i += 2;
        } else if (argv[i] === '--seed') {
            args.seed = parseInt(argv[i+1]);
            i += 2;
        }
    }
    return args;
}

function startServer() {
    let args = parseArgs(process.argv);
    if (isNaN(args.maxPlayers) || isNaN(args.port) || isNaN(args.seed)) {
        console.error('Invalid arguments:');
        if (isNaN(args.maxPlayers)) {
            console.error('- maxPlayers should be a number greater than 1');
        }
        if (isNaN(args.port)) {
            console.error('- port should be a number between 1 and 65535');
        }
        if (isNaN(args.seed)) {
            console.error('- seed should be a number');
        }
    } else {
        new Server(args.maxPlayers, args.debug, args.port, args.seed);
    }
}

startServer();
