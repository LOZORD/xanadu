import * as ServerMessaging from '../game/messaging';
import { PlayerDetailsJSON, PlayerRosterJSON, PlayerInfo } from '../game/player';
import { Logger, LogLevel } from '../logger';
import { CellRepresentation, Position, CellName } from '../game/map/cell';
import * as Character from '../game/character';
import { Socket } from '../socket';

/* CLIENT CHECK AND SETUP */
const isRunningOnClient = typeof window !== 'undefined';

if (isRunningOnClient) {
  // since we're in the client, exporting is not allowed
  // so here's a little hack that fixes the `undefined export` problem
  const w: any = window;
  w.exports = {};
}

/* TYPES AND CLASSES */

type StyleClass = ServerMessaging.MessageType | 'Error' | 'Unknown';

type ContextMode = 'Game' | 'Lobby';

// export type JQueryCreator = (selector: (string | Element)) => JQuery;
export type JQueryCreator = JQueryStatic;

export type JQueryDetailSelectors = {
  current: {
    $health: JQuery;
    $intelligence: JQuery;
    $agility: JQuery;
    $strength: JQuery;
  };
  maximum: {
    $health: JQuery;
    $intelligence: JQuery;
    $agility: JQuery;
    $strength: JQuery;
  }
  $modifiers: JQuery;
  effects: {
    $addictionBox: JQuery;
    $exhaustionBox: JQuery;
    $hungerBox: JQuery;
    $immortalityBox: JQuery;
    $poisonBox: JQuery;
  };
  $mapWrapper: JQuery;
  $playerMap: JQuery;
  $goldAmount: JQuery;
  $itemsWrapper: JQuery;
  _JQUERY_: JQueryCreator;
};

type ViewMessage = {
  styleClasses: StyleClass[];
  content: string;
};

export interface SimpleClientConsole {
  log(...args: any[]): void;
}

// Implements the main Logger inteface, but behaves like Winston too
export class ClientLogger implements Logger {
  level: LogLevel;
  console: SimpleClientConsole;
  readonly levels: LogLevel[] = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
  constructor(console: SimpleClientConsole, level: LogLevel = 'info') {
    this.console = console;
    this.level = level;
  }

  log(level: LogLevel, ...args) {
    const currLevelInd = this.levels.indexOf(this.level);
    const argLevelInd = this.levels.indexOf(level);

    if (argLevelInd <= currLevelInd) {
      this.console.log(level, ...args);
    } else {
      // do nothing
    }
  }
}

/* EXECUTED CODE */

function main() {
  const socket = io('/game', {
    // don't attempt to reconnect if the server dies
    reconnection: false
  });

  const clientLogger = new ClientLogger(console);

  $(document).ready(onDocumentReady($, socket, clientLogger));
}

if (isRunningOnClient) {
  main();
}

/* FUNCTIONS */
export function onDocumentReady($: JQueryCreator, socket: Socket, logger: Logger): () => void {
  return () => {
    assignDOMListensers(socket, $, logger);
    assignClientSocketListeners(socket, $, logger);
    finalViewSetup($);
  };
}

export function assignDOMListensers(socket: Socket, $: JQueryCreator, logger: Logger): void {
  const $form = $('#main-form');
  const $messageInput = $('#main-input');

  $('#parent-container').click(() => $messageInput.focus());

  $('#tab-navs a').click(function (event) {
    event.preventDefault();
    $(this).tab('show');
  });

  $('#roster-data').on('click', '.roster-name a', function (event) {
    handleRosterNameClick($(this), $messageInput, event);
  });

  $form.submit((event) => {
    event.preventDefault();
    let msg = $messageInput.val().trim();
    $messageInput.val('');

    // don't send a blank message!
    if (msg.length) {
      logger.log('debug', 'Sending message: ', msg);
      sendMessage(msg, socket);
    }
  });
}

export function assignClientSocketListeners(socket: Socket, $: JQueryCreator, logger: Logger): void {
  const $detailSelectors = createSelectors($);

  /* * * MESSAGE HANDLER * * */

  socket.on('message', (data: ServerMessaging.MessageJSON) => {
    handleMessage(data, logger, $);
  });

  /* * * DISCONNECT * * */

  socket.on('disconnect', (data) => {
    handleDisconnect(data, logger, $);
  });

  /* * * SERVER STOPPED * * */
  // TODO: do we want this?
  // this could be useful for server-side SIGINTs (#30)
  // socket.on('server-stopped', () => {
  //   addMessage({
  //     content: 'The server been stopped!',
  //     styleClasses: [ 'Error' ]
  //   });
  //   socket.disconnect();
  //   socket.close();
  // });

  /* * * REJECTED FROM ROOM * * */

  socket.on('rejected-from-room', () => {
    handleRejectedFromRoom(socket, $);
  });

  /* * * PLAYER INFO * * */
  socket.on('player-info', (playerInfo: PlayerInfo) => {
    updatePlayerInfo(playerInfo, $);
  });

  /* * * CONTEXT CHANGE * * */

  socket.on('context-change', (newContext: ContextMode) => {
    handleContextChange(newContext, $);
  });

  /* * * DETAILS (RHS PANE) * * */

  socket.on('details', (data: PlayerDetailsJSON) => {
    handleDetails(data, logger, $detailSelectors);
  });

  /* * * ROSTER (RHS PANE) * * */
  socket.on('roster', (data: PlayerRosterJSON[]) => {
    handleRoster(data, logger, $);
  });

  // TODO: add a proper type/interface.
  socket.on('debug', (isDebugActive: boolean) => {
    handleDebug(isDebugActive, logger);
  });
}

export function finalViewSetup($: JQueryCreator): JQueryCreator {
  $('#player-info').hide();
  $('#player-info-name').hide();
  $('#player-info-class').hide();
  $('#game-info-tab').hide();
  $('#main-input').focus();

  addMessage({
    content: 'Welcome! Please enter your name below...',
    styleClasses: ['Game']
  }, $);

  return $;
}

export function handleMessage(data: ServerMessaging.MessageJSON, logger: Logger, $: JQueryStatic) {
  logger.log('debug', 'Received message: ', data);
  const viewMessage = processServerMessage(data);
  addMessage(viewMessage, $);
}

export function handleDisconnect(data: any, logger: Logger, $: JQueryStatic) {
  logger.log('debug', 'Error data', data);
  addMessage({
    content: 'The server has encountered a fatal error!',
    styleClasses: ['Error']
  }, $);
}

export function handleRejectedFromRoom(socket: Socket, $: JQueryStatic) {
  addMessage({
    content: 'The game is at capacity',
    styleClasses: ['Game']
  }, $);
  socket.disconnect();
}

export function handleDetails(data: PlayerDetailsJSON, logger: Logger, $detailSelectors: JQueryDetailSelectors) {
  logger.log('debug', 'Got details: ', data);
  updateDetails($detailSelectors, data);
}

export function handleRoster(data: PlayerRosterJSON[], logger: Logger, $: JQueryStatic) {
  logger.log('debug', 'Got roster: ', data);
  updateRoster(data, $);
}

export function handleDebug(isDebugActive: boolean, logger: Logger) {
  if (isDebugActive) {
    logger.level = 'debug';
  }
}

export function newMessageElement(viewMessage: ViewMessage, $: JQueryCreator): JQuery {
  const listElem = $('<li>');
  const textElem = $('<pre>');

  // use `.text` so whatever we put in the element will only be treated as
  // text and _not_ HTML (or worse, JS)
  textElem.text(viewMessage.content);
  listElem.addClass(viewMessage.styleClasses.join(' '));
  listElem.append(textElem);

  return listElem;
}

export function addMessage(viewMessage: ViewMessage, $: JQueryCreator): JQueryCreator {
  const $newMessage = newMessageElement(viewMessage, $);
  const $messageOutput = $('#messages');
  const $messageInput = $('#main-input');

  $messageOutput.append($newMessage);
  $messageOutput.parent().animate({ scrollTop: $messageOutput.height() }, 150);

  $messageInput.focus();

  return $;
}

export function createSelectors($: JQueryCreator): JQueryDetailSelectors {
  return {
    current: {
      $health: $('#health-current'),
      $agility: $('#agility-current'),
      $intelligence: $('#intelligence-current'),
      $strength: $('#strength-current')
    },
    maximum: {
      $health: $('#health-max'),
      $agility: $('#agility-max'),
      $intelligence: $('#intelligence-max'),
      $strength: $('#strength-max')
    },
    $modifiers: $('#modifier-stats-list'),
    effects: {
      $addictionBox: $('#effect-addiction-box'),
      $exhaustionBox: $('#effect-exhaustion-box'),
      $hungerBox: $('#effect-hunger-box'),
      $immortalityBox: $('#effect-immortality-box'),
      $poisonBox: $('#effect-poison-box')
    },
    $mapWrapper: $('#map-wrapper'),
    $playerMap: $('#player-map'),
    $goldAmount: $('#gold-amount'),
    $itemsWrapper: $('#items-wrapper'),
    _JQUERY_: $
  };
}

export function sendMessage(content: string, sender: Socket) {
  sender.emit('message', {
    content,
    timestamp: Date.now()
  });
}

export function processServerMessage(data: ServerMessaging.MessageJSON): ViewMessage {
  switch (data.type) {
    case 'Game': {
      return {
        content: data.message,
        styleClasses: ['Game']
      };
    }
    case 'Echo': {
      return {
        content: data.message,
        styleClasses: ['Echo']
      };
    }
    case 'Whisper': {
      if (data.from) {
        return {
          content: `${data.from.name} whispered: ${data.message}`,
          styleClasses: ['Whisper']
        };
      } else {
        throw new Error('Got a Whisper message without a `from` field!');
      }
    }
    case 'Talk': {
      if (data.from) {
        return {
          content: `${data.from.name} said: ${data.message}`,
          styleClasses: ['Talk']
        };
      } else {
        throw new Error('Got a Talk message without a `from` field!');
      }
    }
    case 'Shout': {
      if (data.from) {
        return {
          content: `${data.from.name} shouted: ${data.message}`,
          styleClasses: ['Shout']
        };
      } else {
        throw new Error('Got a Shout message without a `from` field!');
      }
    }
    default: {
      return {
        content: `Unknown type for message: \`${data.message}\` (${data.type})`,
        styleClasses: ['Unknown']
      };
    }
  }
}

export function updateDetails($selectors: JQueryDetailSelectors, data: PlayerDetailsJSON): JQueryDetailSelectors {

  const $ = $selectors._JQUERY_;

  // stats
  $selectors.current.$health.text(data.stats.current.health);
  $selectors.maximum.$health.text(data.stats.maximum.health);

  $selectors.current.$agility.text(data.stats.current.agility);
  $selectors.maximum.$agility.text(data.stats.maximum.agility);

  $selectors.current.$intelligence.text(data.stats.current.intelligence);
  $selectors.maximum.$intelligence.text(data.stats.maximum.intelligence);

  $selectors.current.$strength.text(data.stats.current.strength);
  $selectors.maximum.$strength.text(data.stats.maximum.strength);

  // TODO: modifiers
  /*
  if (data.modifiers) {
    $('#modifier-stats-list').empty();

    let modifiers = data.modifiers.sort((modA, modB) => {
      return modA.name < modB.name ? -1 : 1;
    });

    modifiers.forEach((mod) => {
      $('#modifier-stats-list').append(
        `<li><strong>${ mod.name }</strong>: ${ mod.progress }</li>`
      );
    });

  } else {
    $('#modifier-stats-list')
      .empty()
      .html('<li>No active modifiers</li>');
  }
  */

  // effects

  const PROGRESS_BAR_CLASS = '.progress-bar';

  // immortality
  if (data.effects.immortality.isActive) {
    updateProgressBar(
      $selectors.effects.$immortalityBox.find(PROGRESS_BAR_CLASS), 1, 1, false
    );

    $selectors.effects.$immortalityBox.show();

    [
      $selectors.effects.$addictionBox,
      $selectors.effects.$exhaustionBox,
      $selectors.effects.$hungerBox
    ].forEach($box => {
      updateProgressBar($box.find(PROGRESS_BAR_CLASS), 1, 1, false);
    });

    $selectors.effects.$addictionBox.hide();
    $selectors.effects.$poisonBox.hide();
  } else {
    $selectors.effects.$immortalityBox.hide();

    // addiction
    if (data.effects.addiction.isActive) {
      updateProgressBar(
        $selectors.effects.$addictionBox.find(PROGRESS_BAR_CLASS),
        data.effects.addiction.current,
        data.effects.addiction.maximum
      );
      $selectors.effects.$addictionBox.show();
    } else {
      $selectors.effects.$addictionBox.hide();
    }

    // exhaustion
    updateProgressBar(
      $selectors.effects.$exhaustionBox.find(PROGRESS_BAR_CLASS),
      data.effects.exhaustion.current,
      data.effects.exhaustion.maximum
    );

    // hunger
    updateProgressBar(
      $selectors.effects.$hungerBox.find(PROGRESS_BAR_CLASS),
      data.effects.hunger.current,
      data.effects.hunger.maximum
    );

    // poison
    if (data.effects.poison.isActive) {
      updateProgressBar(
        $selectors.effects.$poisonBox.find(PROGRESS_BAR_CLASS), 1, 1
      );

      $selectors.effects.$poisonBox.show();
    } else {
      $selectors.effects.$poisonBox.hide();
      updateProgressBar(
        $selectors.effects.$poisonBox.find(PROGRESS_BAR_CLASS), 0, 1
      );
    }
  }

  // map
  if (data.map) {
    const $colorizedMap = colorizeMap(data.map.grid, data.map.currentPosition, $);
    $selectors.$playerMap.empty();
    $selectors.$playerMap.append($colorizedMap);
    $selectors.$mapWrapper.show();
  } else {
    $selectors.$mapWrapper.hide();
    $selectors.$playerMap.empty();
  }

  // gold
  $selectors.$goldAmount.text(data.gold);

  // items
  $selectors.$itemsWrapper.empty();
  if (data.items.length > 0) {
    data.items.forEach((item) => {
      //let itemData = item.stack || item.condition || -1;
      // TODO: implement item conditions
      let itemData = item.stack;
      let appendedElem = $(
        `
          <div class='item-box row'>
            <div class='col-xs-9 item-name'>${ item.name}</div>
            <div class='col-xs-3 item-data'>${ itemData}</div>
          </div>
          `
      ).appendTo($selectors.$itemsWrapper);

      if (item.stack) {
        appendedElem.find('.item-data').addClass('item-stack');
      } else if (item.hasOwnProperty('condition')) {
        // TODO: this is a little hack -- item condition needs to be implemented
        appendedElem.find('.item-data').addClass(() => {
          let ret = 'item-condition';

          if (itemData > 66) {
            return ret + ' good-condition';
          } else if (itemData > 33) {
            return ret + ' fair-condition';
          } else {
            return ret + ' poor-condition';
          }
        });
      } else {
        throw Error('Unknown item type!');
      }
    });
  } else {
    $selectors.$itemsWrapper.append('<div>Your inventory is empty.</div>');
  }

  return $selectors;
}

export function updateProgressBar($bar: JQuery, current: number, maximum: number, colorize = true): void {
  const percent = 100.0 * current / maximum;
  const percStr = percent.toString() + '%';

  let color: string;

  if (colorize) {
    if (percent > 75) {
      color = 'var(--xanadu-green)';
    } else if (percent > 50) {
      color = 'var(--xanadu-yellow)';
    } else if (percent > 25) {
      color = 'var(--xanadu-orange)';
    } else {
      color = 'var(--xanadu-red)';
    }
  } else {
    color = 'var(--xanadu-white)';
  }

  $bar.css({
    'width': percStr,
    'color': color,
    'border-color': color
  });
}

export function updatePlayerInfo({ playerName, className }: PlayerInfo, $: JQueryCreator): void {
  const showData = playerName || className;

  if (showData) {
    if (playerName) {
      $('#player-info-name').text(playerName).show();
    } else {
      $('#player-info-name').hide();
    }

    if (className) {
      $('#player-info-class').text(className).show();
    } else {
      $('#player-info-class').hide();
    }

    $('#player-info').show();

  } else {
    $('#player-info').hide();
  }
}

export function classNameToString(name: Character.CharacterClassName = 'None'): string {
  if (name === 'None') {
    return '?';
  } else {
    return name.toString();
  }
}

export function allegianceToString(allegiance: Character.Allegiance = 'None'): string {
  if (allegiance === 'None') {
    return '?';
  } else {
    return allegiance.toString();
  }
}

export function updateRoster(rosterData: PlayerRosterJSON[], $: JQueryCreator): void {
  const $rosterDataBox = $('#roster-data');
  const sortedData = rosterData.sort((rosterEntryA, rosterEntryB) => {
    return rosterEntryA.name.localeCompare(rosterEntryB.name);
  });

  const myName = $('#player-info-name').text();

  $rosterDataBox.hide();

  $rosterDataBox.empty();

  sortedData.forEach(rosterEntry => {
    const $rosterRow = $(`
        <div class='row'>
          <div class='col-xs-4 roster-name'>
            <a href='#'>${ rosterEntry.name}</a>
          </div>
          <div class='col-xs-2'>
            ${ rosterEntry.state}
          </div>
          <div class='col-xs-2'>
            ${ classNameToString(rosterEntry.characterClass).substring(0, 3).toUpperCase()}
          </div>
          <div class='col-xs-2'>
            ${ allegianceToString(rosterEntry.allegiance)}
          </div>
          <div class='col-xs-2'>
            ${ rosterEntry.numModifiers}
          </div>
        </div>
        `).appendTo($rosterDataBox);

    if (rosterEntry.name === myName) {
      $rosterRow.addClass('me');
    }
  });

  $rosterDataBox.show();
}

export function handleRosterNameClick($nameAnchor: JQuery, $input: JQuery, event: JQueryEventObject): void {
  event.preventDefault();
  const name = $nameAnchor.text();
  const currentMessage = $input.val() as string;

  if (currentMessage.length) {
    // add this name to the current message
    $input.val(`${currentMessage} ${name} `);
  } else {
    // create a new talk message with this name
    $input.val(`/t ${name} `);
  }
}

export function handleContextChange(newContext: ContextMode, $: JQueryCreator): void {
  if (newContext === 'Game') {
    $('#game-info-tab').show();
  } else if (newContext === 'Lobby') {
    $('#game-info-tab').hide();
  } else {
    throw new Error(`Unknown context mode: ${JSON.stringify(newContext)}`);
  }
}

export function classifyCell(c: CellRepresentation): CellName {
  return {
    '_': 'SimpleRoom',
    'X': 'TreasureRoom',
    '^': 'PassageRoom',
    '#': 'PermanentBarrier',
    '%': 'ExcavatableBarrier',
    '?': 'Unknown'
  }[c];
}

export function cellToSpan(cr: CellRepresentation, playerHere: boolean, $: JQueryCreator): JQuery {
  const $span = $('<span>');

  $span.text(cr);
  $span.addClass(classifyCell(cr));

  if (playerHere) {
    $span.text('*');
    $span.addClass('PlayerHere');
  }

  return $span;
}

export function colorizeMap(grid: CellRepresentation[][], currPos: Position, $: JQueryCreator): JQuery {
  const $cellContainer = $(`<div class='cells'>`);

  for (let rowInd = 0; rowInd < grid.length; rowInd++) {
    for (let colInd = 0; colInd < grid[rowInd].length; colInd++) {
      const currCR = grid[rowInd][colInd];
      const playerIsHere = currPos.row === rowInd && currPos.col === colInd;
      const $span = cellToSpan(currCR, playerIsHere, $);

      $cellContainer.append($span);
    }

    $cellContainer.append($(`<br>`));
  }

  return $cellContainer;
}
