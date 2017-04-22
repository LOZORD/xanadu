# XANADU

A game of precarious alliances and [breaking fast on
honeydew](https://en.wikipedia.org/wiki/Xanadu_(Rush_song)).

Xanadu is a text-based [MUD](https://en.wikipedia.org/wiki/MUD) set in 1910's East Asia.
The Xanadu game client runs in your everyday web browser.

Please see the [Wiki](https://github.com/LOZORD/xanadu/wiki) for more information.

Contributions welcome!

[![Build Status](https://travis-ci.org/LOZORD/xanadu.svg?branch=master)](https://travis-ci.org/LOZORD/xanadu)
[![Build Status](https://ci.appveyor.com/api/projects/status/gpu3aq531v4gdirq?svg=true)](https://ci.appveyor.com/project/LOZORD/xanadu)
[![David](https://img.shields.io/david/LOZORD/xanadu.svg)](https://david-dm.org/LOZORD/xanadu)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/53578fdb9c8049c4959db3053822d127)](https://www.codacy.com/app/ljrudberg/xanadu?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=LOZORD/xanadu&amp;utm_campaign=Badge_Grade)
[![Codacy grade](https://img.shields.io/codacy/LOZORD/xanadu.svg)](https://www.codacy.com/app/LOZORD/xanadu)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/LOZORD/xanadu/blob/master/LICENSE.md)

## To run

### ... in development mode
Make sure you have
- [Node.js](https://nodejs.org)
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
