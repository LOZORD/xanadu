export default class Context {
  constructor(kwargs = {}) {
    this.players    = kwargs.players || [];
    this.maxPlayers = kwargs.maxPlayers || 8;
    this.hasStarted = kwargs.hasStarted || false;
    this.hasEnded   = kwargs.hasEnded || false;
  }
}
