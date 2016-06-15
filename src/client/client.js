/* global io */
let socket = io('/game');

$(document).ready(() => {
  let messageOutput   = $('#messages');
  let detailOutput    = $('#details');

  let form = $('#main-form');
  let input = $('#main-input');

  form.submit((event) => {
    event.preventDefault();
    let msg = input.val().trim();
    input.val('');
    console.log('Sending message: ', msg);
    sendMessage(msg);
  });

  let sendMessage = (msg) => {
    socket.emit('message', {
      message: msg,
      ts: Date.now()
    });
  };

  let processData = (data) => {
    switch (data.type) {
      case 'broadcast': {
        let broadcastIntro;

        if (data.from) {
          broadcastIntro = `${ data.from.name }: `;
        } else {
          broadcastIntro = '';
        }

        let broadcastMessage = broadcastIntro + data.message;
        return {
          messageText: broadcastMessage,
          styleClasses: ['broadcast']
        };
      }
      case 'chat': {
        return {
          messageText: `${ data.from.name }: ${ data.message }`,
          styleClasses: ['chat']
        };
      }
      case 'echo': {
        return {
          messageText: data.message,
          styleClasses: ['echo']
        };
      }
      case 'game': {
        return {
          messageText: data.message,
          styleClasses: ['game']
        };
      }
      case 'shout': {
        return {
          messageText: `${ data.from.name } shouted: ${ data.message }`,
          styleClasses: ['shout']
        };
      }
      case 'whisper': {
        return {
          messageText: `${ data.from.name } whispered: ${ data.message }`,
          styleClasses: ['whisper']
        };
      }
      default: {
        console.log('unknown message type:', data);
        return {
          messageText: data.message,
          styleClasses: ['unknown']
        };
      }
    }
  };

  let addMessage = (messageText, styleClasses = []) => {
    // use `.text` so whatever we put in the element will only be treated as
    // text and _not_ HTML (or worse, JS)
    // XXX: maybe do we want a <pre> _inside_ the <li>?
    let newElem = $('<li>').text(messageText);
    newElem.addClass(styleClasses.join(' '));
    messageOutput.append(newElem);
    messageOutput.parent().scrollTop(messageOutput.parent().height());
    input.focus();
  };

  // Basic welcome message
  // TODO: add word art and/or better/helpful message)
  addMessage('Please enter your name below...', ['game']);

  /*** MESSAGE HANDLER ***/

  socket.on('message', (data) => {
    console.log('Received message:', data);
    let { messageText, styleClasses } = processData(data);
    addMessage(messageText, styleClasses);
  });

  /*** ERROR HANDLER ***/

  // TODO: find a way to gracefully handle and report server crashes to client
  // this might help:
  // http://socket.io/docs/server-api/#namespace#use(fn:function):namespace
  socket.on('error', (error) => {
    addMessage('The server has encountered a fatal error!', ['error']);
    console.log('Received error data: ', error);
    socket.disconnect();
  });

  /*** REJECTED FROM ROOM ***/

  socket.on('rejected-from-room', () => {
    addMessage({
      messageText: 'The game is at capacity',
      styleClasses: ['game']
    });
    socket.disconnect();
  });

  /*** DETAILS (RHS PANE) ***/

  // TODO: see below --> eventually need to render data in correct places
  let updateDetails = (data) => {
    // quasi-debug
    detailOutput.text(JSON.stringify(data));

    // stats
    $('#health-current' ).text(data.stats.health.cur);
    $('#health-max'     ).text(data.stats.health.max);

    $('#agility-current').text(data.stats.agility.cur);
    $('#agility-max'    ).text(data.stats.agility.max);

    $('#intelligence-current' ).text(data.stats.intelligence.cur);
    $('#intelligence-max'     ).text(data.stats.intelligence.max);

    $('#strength-current' ).text(data.stats.strength.cur);
    $('#strength-max'     ).text(data.stats.strength.max);

    // modifiers
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

    // effects
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

    // map
    if (data.map) {
      $('#player-map').text(data.map);
      $('#map-wrapper').show();
    } else {
      $('#map-wrapper').hide();
      $('#player-map').text('');
    }

    // gold
    $('#gold-amount').text(data.gold);

    // items
    $('#item-wrapper').empty();
    data.items.forEach((item) => {
      let itemData = item.stack || item.condition || -1;
      let appendedElem = $(
        `
        <div class='item-box row'>
          <div class='col-xs-9 item-name'>${ item.name }</div>
          <div class='col-xs-3 item-data'>${ itemData }</div>
        </div>
        `
      ).appendTo('#item-wrapper');

      if (item.stack) {
        appendedElem.find('.item-data').addClass('item-stack');
      } else if (item.condition) {
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
        console.error('unknown item data type');
      }
    });

  };

  // TODO: details stream (i.e. inventory, map, etc.) on RHS
  socket.on('details', (data) => {
    console.log('details', data);
    updateDetails(data);
  });

  /*** FINAL VIEW SETUP ***/
  input.focus();

  /*** XXX ONLY FOR TESTING XXX ***/
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
});
