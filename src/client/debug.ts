import { Socket } from '../socket';
const isRunningOnClient = typeof window !== 'undefined';
const TEN_SECONDS = 10 * 1000;
if (isRunningOnClient) {
  // since we're in the client, exporting is not allowed
  // so here's a little hack that fixes the `undefined export` problem
  const w: any = window;
  w.exports = {};

  // Now, run the debug code.
  $(document).ready(onDocumentReady(io('/debug'), $));
}

export function onDocumentReady(
  socket: Socket, $: JQueryStatic, pollCountdown = Infinity, time = TEN_SECONDS
): () => void {
  return () => {
    const $target = $('#debug');
    socket.on('debug-update', (data) => {
      render($target, data);
    });

    beginPolling(socket, pollCountdown, time);
  };
}

export function beginPolling(socket: Socket, pollCountdown = Infinity, time = TEN_SECONDS) {
  let getData = (pc: number, t: number) => {
    socket.emit('get', {});
    if (pc > 0) {
      setTimeout(() => getData(pc - 1, t), t);
    }
  };

  getData(pollCountdown, time);
}

export function render($target: JQuery, data: any): void {
  $target.text(data);
}
