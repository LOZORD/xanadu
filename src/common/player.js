class Player {
  constructor(args) {
    this.socket = args.socket;
    this.character = {}; // TODO
  }

  id () {
    return this.socket.id;
  }
}
