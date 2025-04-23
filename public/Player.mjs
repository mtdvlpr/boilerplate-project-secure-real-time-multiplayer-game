class Player {
  constructor({ x, y, score = 0, id }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(dir, speed) {
    if (dir === "left") this.x -= speed;
    if (dir === "right") this.x += speed;
    if (dir === "up") this.y -= speed;
    if (dir === "down") this.y += speed;
  }

  collision(item) {
    const playerSize = 20;
    const itemSize = 10;

    return (
      this.x < item.x + itemSize &&
      this.x + playerSize > item.x &&
      this.y < item.y + itemSize &&
      this.y + playerSize > item.y
    );
  }

  calculateRank(players) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const rank = sortedPlayers.findIndex((player) => player.id === this.id) + 1;
    return `Rank: ${rank} / ${players.length}`;
  }
}

export default Player;
