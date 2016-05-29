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
      msg: msg,
      ts: Date.now()
    });
  };

  let processData = (data) => {
    switch (data.type) {
      case 'broadcast': {
        let broadcastIntro;

        if (data.from) {
          broadcastIntro = `${ data.from }: `;
        } else {
          broadcastIntro = '';
        }

        let broadcastMessage = broadcastIntro + data.msg;
        return {
          messageText: broadcastMessage,
          styleClasses: ['broadcast']
        };
      }
      case 'chat': {
        return {
          messageText: `${ data.from }: ${ data.msg }`,
          styleClasses: ['chat']
        };
      }
      case 'echo': {
        return {
          messageText: data.msg,
          styleClasses: ['echo']
        };
      }
      case 'game': {
        return {
          messageText: data.msg,
          styleClasses: ['game']
        };
      }
      case 'shout': {
        return {
          messageText: `${ data.from } shouted: ${ data.msg }`,
          styleClasses: ['shout']
        };
      }
      case 'whisper': {
        return {
          messageText: `${ data.from } whispered: ${ data.msg }`,
          styleClasses: ['whisper']
        };
      }
      default: {
        console.log('unknown message type:', data);
        return {
          messageText: data.msg,
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
      $('#player-map').text(data.map).show();
    } else {
      $('#player-map').hide().text('');
    }

    // gold
    $('#gold-amount').text(data.gold);

    // items
    let numItems = data.items.length;
    $('.item-slot').each((indx, elem) => {
      let $elem = $(elem);

      if (indx < numItems) {
        let item = data.items[indx];

        $elem.find('.item-name').text(item.name);

        if (item.quality) {
          $elem.find('.item-quality').text(item.quality).show();
        } else {
          $elem.find('.item-quality').hide().text('');
        }

        if (item.stack) {
          $elem.find('.item-stack').text(item.stack).show();
        } else {
          $elem.find('.item-stack').hide().text('');
        }
      } else {
        $elem.find('.item-name').text('');
        $elem.find('.item-quality').text('');
        $elem.find('.item-stack').text('');
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
      { name: 'Pistol', quality: 33 },
      { name: 'Water', stack: 4 },
      { name: 'Something' }
    ]
  });
  console.log(updateDetails);
});
