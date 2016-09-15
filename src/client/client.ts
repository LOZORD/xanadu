import * as ServerMessaging from '../game/messaging';
import { PlayerDetailsJSON, PlayerRosterJSON, PlayerInfo } from '../game/player';
import { Logger } from '../logger';
import { CellRepresentation, Position, CellName } from '../game/map/cell';
import * as Character from '../game/character';

/* TYPES */

type StyleClass = ServerMessaging.MessageType | 'Error' | 'Unknown';

type ContextMode = 'Game' | 'Lobby';

export type JQueryCreator = (selector: (string | Element)) => JQuery;

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
  $effects: JQuery;
  $mapWrapper: JQuery;
  $playerMap: JQuery;
  $goldAmount: JQuery;
  $itemsWrapper: JQuery;
  _JQUERY_: JQueryCreator;
};

type ViewMessage = {
  styleClasses: StyleClass[];
  content: string;
}

/* EXECUTED CODE */

const isRunningOnClient = typeof window !== 'undefined';

if (isRunningOnClient) {
  const socket = io('/game', {
    // don't attempt to reconnect if the server dies
    reconnection: false
  });

  $(document).ready(onDocumentReady($, socket, console));

  // since we're in the client, exporting is not allowed
  // so here's a little hack that fixes the `undefined export` problem
  const w: any = window;
  w.exports = {};
}

/* FUNCTIONS */

export function onDocumentReady($: JQueryCreator, socket: SocketIOClient.Socket, logger: Logger): () => void {
  return () => {
    assignDOMListensers(socket, $, logger);
    assignClientSocketListeners(socket, $, logger);
    finalViewSetup($);
  };
}

export function assignDOMListensers(socket: SocketIOClient.Socket, $: JQueryCreator, logger: Logger): void {
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

export function assignClientSocketListeners(socket: SocketIOClient.Socket, $: JQueryCreator, logger: Logger): void {
  const $detailOutput = $('#details');
  const $detailSelectors = createSelectors($);

  /* * * MESSAGE HANDLER * * */

  socket.on('message', (data: ServerMessaging.MessageJSON) => {
    logger.log('debug', 'Received message: ', data);
    const viewMessage = processServerMessage(data);
    addMessage(viewMessage, $);
  });

  /* * * DISCONNECT * * */

  socket.on('disconnect', (data) => {
    addMessage({
      content: 'The server has encountered a fatal error!',
      styleClasses: [ 'Error' ]
    }, $);
    logger.log('debug', 'Error data', data);
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
    addMessage({
      content: 'The game is at capacity',
      styleClasses: [ 'Game' ]
    }, $);
    socket.disconnect();
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
    logger.log('debug', 'Got details: ', data);
    // quasi-debug
    $detailOutput.text(JSON.stringify(data));
    updateDetails($detailSelectors, data);
  });

  /* * * ROSTER (RHS PANE) * * */
  socket.on('roster', (data: PlayerRosterJSON[]) => {
    logger.log('debug', 'Got roster: ', data);

    updateRoster(data, $);
  });
}

export function finalViewSetup($: JQueryCreator): JQueryCreator {
  $('#player-info').hide();
  $('#player-info-name').hide();
  $('#player-info-class').hide();
  $('#game-info-tab').hide();
  $('#main-input').focus();

  addMessage({
    content: 'Please enter your name below...',
    styleClasses: [ 'Game' ]
  }, $);

  return $;
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
  // FIXME: the scrolling is broken
  $messageOutput.parent().scrollTop($messageOutput.parent().height());

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
    $effects: $('#effect-stats-list'),
    $mapWrapper: $('#map-wrapper'),
    $playerMap: $('#player-map'),
    $goldAmount: $('#gold-amount'),
    $itemsWrapper: $('#items-wrapper'),
    _JQUERY_: $
  };
}

export function sendMessage(content: string, sender: SocketIOClient.Socket) {
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
        styleClasses: [ 'Game' ]
      };
    }
    case 'Echo': {
      return {
        content: data.message,
        styleClasses: [ 'Echo' ]
      };
    }
    case 'Whisper': {
      return {
        content: `${data.from.name} whispered: ${data.message}`,
        styleClasses: [ 'Whisper' ]
      };
    }
    case 'Talk': {
      return {
        content: `${data.from.name} said: ${data.message}`,
        styleClasses: [ 'Talk' ]
      };
    }
    case 'Shout': {
      return {
        content: `${data.from.name} shouted: ${data.message}`,
        styleClasses: [ 'Shout' ]
      };
    }
    default: {
      return {
        content: `Unknown type for message: \`${data.message}\` (${data.type})`,
        styleClasses: [ 'Unknown' ]
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

  // TODO: effects
  /*
  if (data.effects) {
    $('#effect-stats-list').empty();
    data.effects.sort().forEach((effect) => {
      $('#effect-stats-list').append(
        `<li><strong>${ effect }</strong></li>`
      );
    });
  } else {
    $('#effect-stats-list')
      .empty()
      .html('<li>No active effects</li>');
  }
  */

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
            ${ classNameToString(rosterEntry.characterClass)}
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
    throw new Error(`Unkown context mode: ${newContext}`);
  }
}

export function createClientLogger(console: Console): Logger {
  // TODO: wrap console.log so output is similar to Winston's levels
  // maybe even include winston instead?
  return console; // TODO: implement me!
}

export function classifyCell(c: CellRepresentation): CellName {
  return {
    '_': 'SimpleRoom',
    'X': 'TreasureRoom',
    '^': 'PassageRoom',
    '#': 'PermanentBarrier',
    '%': 'ExcavatableBarrier',
    '?': 'Unknown'
  }[ c ];
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
    for (let colInd = 0; colInd < grid[ rowInd ].length; colInd++) {
      const currCR = grid[ rowInd ][ colInd ];
      const playerIsHere = currPos.row === rowInd && currPos.col === colInd;
      const $span = cellToSpan(currCR, playerIsHere, $);

      $cellContainer.append($span);
    }

    $cellContainer.append($(`<br>`));
  }

  return $cellContainer;
}
