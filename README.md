# XANADU

A game of precarious alliances and [breaking fast on
honeydew](https://en.wikipedia.org/wiki/Xanadu_(Rush_song)).

Xanadu is a text-based [MUD](https://en.wikipedia.org/wiki/MUD) set in 1910's East Asia.
The Xanadu game client runs in your everyday web browser.

Please see the [Wiki](https://github.com/LOZORD/xanadu/wiki) for more information.

Contributions welcome!

__This project uses ES6 + Babel. Please follow that convention.__

## To run:
```bash
$ npm install
# ...
$ npm run now # lints, builds, and launches
```

## To lint:
```bash
$ npm run lint
```

## To build:
```bash
$ npm run build
```

The `dist/` directory now contains all ES5- and Node-runnable code.

## To launch:
```bash
$ npm run launch
```

## Debug page
To access the `debug` page (in the browser), visit
`localhost:<port>/debug.html`. It shows useful
information about game and player states.

This command creates a new `Game` instance and fires up the server.
