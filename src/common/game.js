class Game {
  constructor(args = {}) {
    this.players = args.players || [];
    this.map = this.generateMap();
    this.setupMap(this.socketRoom);
    this.hasStarted = false;
    this.hasEnded   = false;
    this.turnNumber = 0;
  }
  generateMap(N = 16) {
    // TODO: generate an NxN dungeon
    let oneDim = new Array(16);

    oneDim.forEach((_elem, i) => {
        oneDim[i] = new Array(16);
    });

    // generation logic would go here...
  }
  update() {
    // the main update ("tick") logic will go here
  }
}
