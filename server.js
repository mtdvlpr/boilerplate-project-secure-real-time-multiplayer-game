require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const expect = require("chai");
const socket = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");

const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner.js");

const app = express();

app.use(helmet({ hidePoweredBy: false }));

app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "PHP 7.4.3");
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

app.use("/public", express.static(process.cwd() + "/public"));
app.use("/assets", express.static(process.cwd() + "/assets"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({ origin: "*" }));

// Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log("Tests are not valid:");
        console.error(error);
      }
    }, 1500);
  }
});

const Player = require("./public/Player.mjs").default;
const Collectible = require("./public/Collectible.mjs").default;

const players = {};
const collectibles = [];

setInterval(() => {
  const id = Date.now();
  const x = Math.floor(Math.random() * 620) + 10;
  const y = Math.floor(Math.random() * 460) + 10;
  collectibles.push(new Collectible({ x, y, value: 1, id }));
}, 5000);

const io = socket(server);
io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  players[socket.id] = new Player({ x: 100, y: 100, score: 0, id: socket.id });

  io.emit("update", {
    players: Object.fromEntries(
      Object.entries(players).map(([id, player]) => [id, { ...player }])
    ),
    collectibles: collectibles.map((item) => ({ ...item })),
  });

  socket.on("move", (dir) => {
    const player = players[socket.id];
    if (player) {
      player.movePlayer(dir, 5);

      collectibles.forEach((item, index) => {
        if (player.collision(item)) {
          player.score += item.value;
          collectibles.splice(index, 1);
        }
      });

      io.emit("update", {
        players: Object.fromEntries(
          Object.entries(players).map(([id, player]) => [id, { ...player }])
        ),
        collectibles: collectibles.map((item) => ({ ...item })),
      });
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("update", {
      players: Object.fromEntries(
        Object.entries(players).map(([id, player]) => [id, { ...player }])
      ),
      collectibles: collectibles.map((item) => ({ ...item })),
    });
    console.log(`Player disconnected: ${socket.id}`);
  });
});

module.exports = app; // For testing
