class Entity {
  // origin (0,0) is at NW corner of the map
  constructor(args = {}) {
    this.x = args.x || 0;
    this.y = args.y || 0;
  }
  
  setPos(newPos) {
    this.x = newPos.x || this.x;
    this.y = newPos.y || this.y;
  }

  moveUp() {
    this.y -= 1;
  }

  moveDown() {
    this.y += 1;
  }

  moveLeft() {
    this.x -= 1;
  }

  moveRight() {
    this.x += 1;
  }
}

module.exports = Entity;
