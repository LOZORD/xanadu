let socket = io();

$(document).ready(() => {
  let parentContainer = $('#parent-container');
  let messageOutput   = $('#messages');

  let form = $('#main-form');
  let input = $('#main-input');

  form.submit((event) => {
    event.preventDefault();
    let msg = input.val().trim();
    input.val('');
    console.log(msg);
    if (msg) {
      addMessage(msg);
    }
  });

  let addMessage = (msg) => {
    messageOutput.append($('<li>').text(msg));
    messageOutput.parent().scrollTop(messageOutput.parent().height());
    input.focus();
  };

  input.focus();
});
