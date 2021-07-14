class Position {
  x;
  y;
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
  equals(position) {
    return this.x === position && this.y === position;
  }
}

export default Position;
