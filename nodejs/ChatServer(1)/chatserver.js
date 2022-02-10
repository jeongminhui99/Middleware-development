const express = require("express");
const http = require("http");
const path = require("path");
const bodyPaser = require('body-parser');
const socketio = require("socket.io");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

const io = socketio(server,{
    cors: {
        origin: 'http://localhost:7000',
        methods: ["GET", "POST"]
    }
});

//require('./io-handler')(io);

app.use(cors());
app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client_web/build')));

app.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '/client_web/build/index.html'));
})

server.listen(process.argv[2]);
console.log(process.argv[2] +' Server Started!! ');


io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  console.log(username);
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  // fetch existing users
  console.log("connect");
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });

  // forward the private message to the right recipient
  socket.on("private message", ({ content, to }) => {
    console.log(to, ": ", content);
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    });
  });

  // notify users upon disconnection
  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnected", socket.id);
  });
});

// const PORT = process.env.PORT || 7000;

// httpServer.listen(PORT, () =>
//   console.log(`server listening at http://localhost:${PORT}`)
// );
