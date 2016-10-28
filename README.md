# XANADU

A game of precarious alliances and [breaking fast on
honeydew](https://en.wikipedia.org/wiki/Xanadu_(Rush_song)).

Xanadu is a text-based [MUD](https://en.wikipedia.org/wiki/MUD) set in 1910's East Asia.
The Xanadu game client runs in your everyday web browser.

Please see the [Wiki](https://github.com/LOZORD/xanadu/wiki) for more information.

Contributions welcome!

[![Build Status](https://travis-ci.org/LOZORD/xanadu.svg?branch=master)](https://travis-ci.org/LOZORD/xanadu)

## To run

### ... in development mode
Make sure you have
- [Node](https://nodejs.org)
- [npm](https://npmjs.com)

Then, run the following commands in the terminal:

```bash
$ npm install
$ npm run now
```

## Debug page

First, make sure the `--debug` flag is passed when starting the server:

```bash
$ npm run launch -- --debug
# or
$ npm run launch:debug
```

To access the `debug` page (in the browser), visit
`localhost:<port>/debug.html`.

It shows useful information about the game and player states.
