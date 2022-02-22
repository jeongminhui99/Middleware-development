const express = require("express");
const http = require("http");
const path = require("path");
//const bodyPaser = require('body-parser');
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
    transport: ["websocket"]
});

const { setupWorker } = require("@socket.io/sticky");
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { RedisSessionStore } = require("./sessionStore");
const sessionStore = new RedisSessionStore(redisClient);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/rsp/build')));

app.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '/client/rsp/build/index.html'));
})


io.use(async (socket, next) => {
    console.log("io.use");
    const sessionID = socket.handshake.auth.sessionID; 
    // 가장 먼저 CONNECTION들어가기 전에 SESSIONID 있는지 확인
    //finding existing session
    const session = await sessionStore.findSession(sessionID);
    if(sessionID){
        socket.sessionID = sessionID;
        socket.userID = session.userID;
        socket.username = session.username;
        console.log("io.use 세션 있음")
        return next();
    }
    // 처음 연결되는 경우 즉, SESSIONID 없으면 
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username")); // 새로운 세션 계속 안생기게 해주는 것
        // USERNAME 입력시에만 세션이 만들어짐 
    }
    console.log("io.use 세션 새로 생성", username);
    //create new session
    socket.sessionID = randomId();
    socket.userID = randomId();
    socket.username = username;
    next();
});

io.on("connection", async (socket) => {
    console.log("connection!!");

    sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: true,
    });
    console.log("connect: saveSession");

    // emit session details
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
        username: socket.username,
    });

    socket.on("sessionOut", async () => { // 아예 세션 삭제 
        const matchingSockets = await io.in(socket.userID).allSockets();
        sessionStore.deleteSession(socket.sessionID);
    });



    socket.on("disconnect", async () => { 
        const matchingSockets = await io.in(socket.userID).allSockets();
        const isDisconnected = matchingSockets.size === 0;
        console.log("isDisconnected", isDisconnected, socket.username);
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
        // 여기서 삭제를 하게 되면 새로고침할 때마다 세션이 삭제됨
        //sessionStore.deleteSession(socket.sessionID);
    });
});

// The setupWorker method provided by the @socket.io/sticky will take care of the synchronization 
// between the master and the worker.
// https://npm.io/package/@socket.io/sticky
setupWorker(io);