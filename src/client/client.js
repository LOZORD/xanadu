let socket = io();

$(document).ready(() => {
  let parentContainer = $('#parent-container');
  parentContainer.append('socket and jquery are ready!');

  let form = $('#main-form');
  // TODO: style this
  let input = $('#main-input');

  form.submit((event) => {
    event.preventDefault();
    let msg = input.val();
    input.val('');
    console.log(msg);
  });
});
