class Map {
  constructor(kwargs = []) {
    // TODO
    this.cells = null; // TODO
    this.dimension = kwargs.dimension;
  }
  hasCell(i, j) {
    let d = this.dimension;
    return (
      0 <= i &&
      i < d &&
      0 <= j &&
      j < d
    );
  }
  getCell(i, j) {
    return null; // TODO
  }
}

module.exports = Map;
