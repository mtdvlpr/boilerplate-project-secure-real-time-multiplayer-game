class Collectible {
  constructor({ x, y, value = 1, id }) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
  }
}

export default Collectible;
