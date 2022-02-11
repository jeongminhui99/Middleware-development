const express = require("express");
const http = require("http");
const path = require("path");
const bodyPaser = require('body-parser');
const socketio = require("socket.io");
const Redis = require("ioredis"); // nodejs에서 redis 명령어를 사용하기 위한 모듈
const cors = require("cors");
const socketredis = require("socket.io-redis");

const app = express();
const redisClient = new Redis();
const server = http.createServer(app);

const io = socketio(server,{
    cors: {
        origin: 'http://localhost:7000',
        methods: ["GET", "POST"]
    },
    adapter: socketredis({
        pubClient: redisClient,
        subClient: redisClient.duplicate(),
    }),
    //transport: ["websocket"]
});

const { setupWorker } = require("@socket.io/sticky");
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");


const { RedisSessionStore } = require("./sessionStore");
const sessionStore = new RedisSessionStore(redisClient);

// const { InMemorySessionStore } = require("./sessionStore");
// const sessionStore = new InMemorySessionStore();

//require('./io-handler')(io);

app.use(cors());
app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client_web/build')));

app.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '/client_web/build/index.html'));
})

// server.listen(process.argv[2]);
// console.log(process.argv[2] +' Server Started!! ');


io.use(async (socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
      //finding existing session
      const session = await sessionStore.findSession(sessionID);
      if (session) {
        socket.sessionID = sessionID;
        socket.userID = session.userID;
        socket.username = session.username;
        return next();
      }
  }
  const username = socket.handshake.auth.username;
  console.log(sessionID, username);
  if (!username) {
    return next(new Error("invalid username"));
  }
  //create new session
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username;
  next();
});

io.on("connection", async (socket) => {
  // fetch existing users
  console.log("connect", socket.sessionID);

  // persist session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // emit session details
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // join the "userID" room
  socket.join(socket.userID);

  // fetch existing users
  const users = [];
  const [sessions] = await Promise.all([
    sessionStore.findAllSessions(),
  ]);
  sessions.forEach((session) => {
    users.push({
        userID: session.userID,
        username: session.username,
        connected: session.connected,
    });
  });

  socket.emit("users", users);

//   for (let [id, socket] of io.of("/").sockets) {
//     users.push({
//       userID: id,
//       username: socket.username,
//     });
//   }
//  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // forward the private message to the right recipient
  socket.on("private message", ({ content, to }) => {
    console.log(to, ": ", content);
    socket.to(to).to(socket.userID).emit("private message", {
      content,
      from: socket.userID,
      to,
    });
  });

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
        // nofity other users
        socket.broadcast.emit("user disconnected", socket.userID);
        // update the connection status of the session
        sessionStore.saveSession(socket.sessionID, {
            userID: socket.userID,
            username: socket.username,
            connected: false,
        });
    }
    //socket.broadcast.emit("user disconnected", socket.id);
  });
});

// const PORT = process.env.PORT || 7000;

// httpServer.listen(PORT, () =>
//   console.log(`server listening at http://localhost:${PORT}`)
// );

setupWorker(io);