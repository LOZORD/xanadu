/* global io */

//import * as io from 'socket.io-client';
//import * as $ from 'jquery';
import * as ServerMessaging from '../game/messaging';
import { PlayerDetailsJSON } from '../game/player';
import { Logger } from '../logger';

/* TYPES */

type StyleClass = ServerMessaging.MessageType | 'Error' | 'Unknown';

type JQueryCreator = (selector: string) => JQuery;

// this is ok to export as it will be removed during compilation via tsc
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
  const w: any = <any> window;
  w.exports = {};
}

/* FUNCTIONS */

export function onDocumentReady($: JQueryCreator, socket: SocketIOClient.Socket, logger: Logger): () => void {
  return function () {
    let messageOutput = $('#messages');
    let detailOutput = $('#details');

    let form = $('#main-form');
    let input = $('#main-input');

    $('#parent-container').click(() => input.focus());

    form.submit((event) => {
      event.preventDefault();
      let msg = input.val().trim();
      input.val('');

      // don't send a blank message!
      if (msg.length) {
        logger.log('info', 'Sending message: ', msg);
        sendMessage(msg, socket);
      }
    });

    let addMessage = (viewMessage: ViewMessage) => {
      // use `.text` so whatever we put in the element will only be treated as
      // text and _not_ HTML (or worse, JS)
      // XXX: maybe do we want a <pre> _inside_ the <li>?
      let newElem = $('<li>').text(viewMessage.content);
      newElem.addClass(viewMessage.styleClasses.join(' '));
      messageOutput.append(newElem);
      messageOutput.parent().scrollTop(messageOutput.parent().height());
      input.focus();
    };

    // Basic welcome message
    // TODO: add word art and/or better/helpful message)
    addMessage({
      content: 'Please enter your name below...',
      styleClasses: [ 'Game' ]
    });

    /* * * MESSAGE HANDLER * * */

    socket.on('message', (data: ServerMessaging.MessageJSON) => {
      logger.log('debug', 'Received message: ', data);
      const viewMessage = processServerMessage(data);
      addMessage(viewMessage);
    });

    /* * * DISCONNECT * * */

    socket.on('disconnect', (data) => {
      addMessage({
        content: 'The server has encountered a fatal error!',
        styleClasses: [ 'Error' ]
      });
      logger.log('debug', 'Error data', data);
    });

    /* * * REJECTED FROM ROOM * * */

    socket.on('rejected-from-room', () => {
      addMessage({
        content: 'The game is at capacity',
        styleClasses: [ 'Game' ]
      });
      socket.disconnect();
    });

    /* * * DETAILS (RHS PANE) * * */

    // TODO: add player name and character class somewhere too

    const $detailSelectors = createSelectors($);

    socket.on('details', (data: PlayerDetailsJSON) => {
      logger.log('debug', 'Got details: ', data);
      // quasi-debug
      detailOutput.text(JSON.stringify(data));
      updateDetails($detailSelectors, data);
    });

    /* * * FINAL VIEW SETUP * * */
    input.focus();

    /* * * XXX ONLY FOR TESTING XXX * * */
    updateDetails($detailSelectors, {
      stats: {
        maximum: {
          health: 10,
          agility: 10,
          intelligence: 10,
          strength: 10
        },
        current: {
          health: 5,
          agility: 4,
          intelligence: 3,
          strength: 2
        }
      },
      gold: 50,
      items: [
        {
          name: 'Pistol',
          stack: 1
        },
        {
          name: 'Water',
          stack: 4
        }
      ]
    });
    /*
    updateDetails({
      stats: {
        health:   { cur: 5, max: 10 },
        agility:  { cur: 5, max: 10 },
        intelligence: { cur: 5, max: 10 },
        strength:     { cur: 5, max: 10 }
      },
      gold: 50,
      items: [
        { name: 'Pistol', condition: 44 },
        { name: 'Water', stack: 4 },
        { name: 'Something', condition: 11 },
        { name: 'FooBar', condition: 88 },
        { name: 'Baz', condition: 88 },
        { name: 'Quux', stack: 1 }
      ]
    });
    */
  };
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
    // TODO: implement something like `Map.show`
    $selectors.$playerMap.text(data.map.grid.toString());
    $selectors.$mapWrapper.show();
  } else {
    $selectors.$mapWrapper.hide();
    $selectors.$playerMap.text('');
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
