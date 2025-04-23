import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";

const socket = io();
const canvas = document.getElementById("game-window");
const context = canvas.getContext("2d");

let players = {};
let collectibles = [];

socket.on(
  "update",
  ({ players: serverPlayers, collectibles: serverCollectibles }) => {
    players = Object.fromEntries(
      Object.entries(serverPlayers).map(([id, data]) => [id, new Player(data)])
    );
    collectibles = serverCollectibles.map((data) => new Collectible(data));

    renderGame();
  }
);

document.addEventListener("keydown", (e) => {
  const directions = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
  };
  if (directions[e.key]) {
    socket.emit("move", directions[e.key]);
  }
});

function renderGame() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  const playerList = Object.values(players);

  playerList.forEach((player) => {
    if (player.id === socket.id) {
      context.fillStyle = "green"; // Current player color
    } else {
      context.fillStyle = "blue"; // Other players' color
    }

    context.fillRect(player.x, player.y, 20, 20);

    context.fillStyle = "black";
    context.fillText(player.score, player.x, player.y - 5);

    const rank = player.calculateRank(playerList);
    context.fillText(rank, player.x, player.y + 30);
  });

  collectibles.forEach((item) => {
    context.fillStyle = "gold";
    context.fillRect(item.x, item.y, 10, 10);
  });
}
