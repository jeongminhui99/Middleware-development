const express = require("express");
const http = require("http");
const path = require("path");
const REDIS_PORT = 6380;
//const bodyPaser = require('body-parser');
//const Redis = require("redis");
const socketio = require("socket.io");
const Redis = require("ioredis"); // nodejs에서 redis 명령어를 사용하기 위한 모듈
const cors = require("cors");
const socketredis = require("socket.io-redis");

const app = express();
const redisClient = new Redis(REDIS_PORT);
// const redisClient = Redis.createClient({
//     host : 'localhost', 
//     port : 6380
// });
const server = http.createServer(app);

const room_people_cnt = 2;

const io = socketio(server,{
    cors: {
        origin: 'http://localhost:7000',
        methods: ["GET", "POST"]
    },
    // adapter: socketredis({
    //     pubClient: redisClient,
    //     subClient: redisClient.duplicate(),
    // }),
    transport: ["websocket"]
});

io.adapter(socketredis({host: 'localhost', port: 6380}));

const { setupWorker } = require("@socket.io/sticky");
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { RedisJsonStore } = require("./redisJsonStore");
const jsonStore = new RedisJsonStore(redisClient);

const { RedisSessionStore } = require("./sessionStore");
const sessionStore = new RedisSessionStore(redisClient);

const { RedisRoomStore, InMemoryRoomStore } = require("./roomStore");
const { listeners } = require("process");
const { type } = require("express/lib/response");
const roomStore = new  InMemoryRoomStore();
const redis_room = new RedisRoomStore(redisClient);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/rsp/build')));

app.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '/client/rsp/build/index.html'));
})

const tmp = new Map();



io.use(async (socket, next) => {
    console.log("io.use");
    const sessionID = socket.handshake.auth.sessionID; 
    // 가장 먼저 CONNECTION들어가기 전에 SESSIONID 있는지 확인
    //finding existing session
    const session = await sessionStore.findSession(sessionID);
    if(session){
        console.log("io.use 세션 있음", sessionID);
        socket.sessionID = sessionID;
        socket.userID = session.userID;
        socket.username = session.username;
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
    //console.log("connection!!". socket.userID);

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

    whiteTeam = {
        "total_pita" : 24,
        "users" : {
                "userId" : 123,
                "IsBlocked": 123,
                "currentLocation" : "서울"
        }
    }

    whiteTeam1 = {
        "total_pita" : 25,
        "users" : {
                "userId" : 123,
                "IsBlocked": 123,
                "currentLocation" : "서울"
        }
    }

    room = {
        roomPin: '98771',
        server_start: '2022-05-16T10:08:22.578Z',
        server_end: '2022-05-16T10:08:22.578Z',
        blackTeam: {
          total_pita: 500,
          users: [Object],
          _id: '6282229681b5f131c5666dc7'
        },
        whiteTeam: {
          total_pita: '1970-01-01T00:00:00.500Z',
          users: [Object],
          _id: '6282229681b5f131c5666dc9'
        },
        companyA: {
          abandonStatus: false,
          penetrationTestingLV: [Array],
          attackLV: [Array],
          sections: [Array],
          _id: '6282229681b5f131c5666dbd'
        },
        companyB: {
          abandonStatus: false,
          penetrationTestingLV: [Array],
          attackLV: [Array],
          sections: [Array],
          _id: '6282229681b5f131c5666dbd'
        },
        companyC: {
          abandonStatus: false,
          penetrationTestingLV: [Array],
          attackLV: [Array],
          sections: [Array],
          _id: '6282229681b5f131c5666dbd'
        },
        companyD: {
          abandonStatus: false,
          penetrationTestingLV: [Array],
          attackLV: [Array],
          sections: [Array],
          _id: '6282229681b5f131c5666dbd'
        },
        companyE: {
          abandonStatus: false,
          penetrationTestingLV: [Array],
          attackLV: [Array],
          sections: [Array],
          _id: '6282229681b5f131c5666dbd'
        }
    }
    
    socket.on("jsonTest", async () => {
        console.log("jsonTest");

        //jsonStore.test(whiteTeam, "whiteTeam");
        jsonStore.storejson(room, 98771);
       
        // const j = await jsonStore.getjson("whiteTeam");
        // console.log(JSON.parse(j));

        // jsonStore.updatejson(whiteTeam1, "whiteTeam");

        // jsonStore.deletejson("whiteTeam");
        //console.log(typeof JSON.parse(j));
    });

    // join the "userID" room
    // socket.join(socket.userID);

    socket.on("players_list", (room) => {
        redis_room.findRoomPlayers(room).then(data => {
            console.log("players_list: ", room, data);
            socket.to(room).emit("players", data);
            socket.emit("players", data);
        })
    });

    socket.on("join_playroom", (room) => {
        var n = 0;
        redis_room.findRoomPlayers(room).then(data => {
            n = data.length;
            if (n >= room_people_cnt){
                // join하려는 방 인원 수를 체크하고 만약 제한 인원 초과일 경우
                socket.emit("join_res", 0); // 0은 초과
            } else {
                socket.emit("join_res", 1); // 1은 인원 아직 괜춘
                socket.join(room);
                redis_room.saveRoomPlayer(room, socket.userID, socket.username);
                redis_room.findRoomPlayers(room).then(data => {
                    //socket.to(room).emit("players", data); 이렇게 하면 왜 안될까???
                    socket.to(room).emit("player connected", socket.username);
                    socket.emit("players", data);
                })
            }
        });
        console.log("join_playroom : ", io.of('/').adapter.sids);
        
    });

    socket.on("finish_game", (room) => {
        //socket.to(room).emit("player disconnected", socket.username);
        redis_room.deletePlayer(room, socket.userID, socket.username);
        socket.to(room).emit("player_finish_game", socket.username);
        socket.leave(room);
    });


    socket.on("play", (datas) => {
        var ready_time = 5;
        var start_time = 15;
        console.log("play:", datas);
        // 현재 redis에 조인되어 있는 인원 수 체s크 
        // 여기서는 2명이면 바로 카운트 시작
        redis_room.findRoomPlayers(datas[1]).then(data => {
            console.log("play_Data: ", data.length);
            if(data.length == room_people_cnt){
                socket.to(datas[1]).emit("start", 1);
                socket.emit("start", 1);
                var time = setInterval(ready_cnt, 1000);
                var time2 = setInterval(start_cnt, 1000);
                function ready_cnt(){
                    console.log("ready_cnt", ready_time);
                    socket.emit("ready_cnt", ready_time);
                    if(ready_time == 0){
                        clearInterval(time);
                    }
                    ready_time--;
                }
                function start_cnt(){
                    //console.log("start_cnt", start_time);
                    socket.emit("start_cnt", start_time);
                    if(start_time == 0){
                        clearInterval(time2);
                    }
                    start_time--;
                }
            } 
        })
    });

    socket.on("rsp_choice", (data) => {
        console.log(data[0], data[1]);
        socket.to(data[1]).emit("player_choice", data[0]);
    });

    // var rsp_time = setInterval(start_rsp, 1000);
    // function start_rsp(){
    //     console.log("start_rsp", rsp_cnt);
    //     socket.emit("start_rsp", time);
    //     if(rsp_cnt == 0){
    //         clearInterval(rsp_time);
    //     }
    //     rsp_cnt--;
    // }


    socket.on("leave_playroom", (room) => {
        console.log("leave_playroom : ", room);
        redis_room.deletePlayer(room, socket.userID, socket.username);
        socket.leave(room);
        //console.log("leave_playroom :", io.of('/').adapter.sids);
    });

    socket.on("sessionOut", async () => { // 아예 세션 삭제 
        console.log("sessionout");
        //const matchingSockets = await io.in(socket.userID).allSockets();
        const promise1 = new Promise(()=> {
            sessionStore.deleteSession(socket.sessionID);
            console.log("delete");
        });
        promise1.then(()=> {
            socket.disconnect();
            console.log("out!");
        }).catch(()=>{
            console.log("catch!");
        })
        //await sessionStore.deleteSession(socket.sessionID);
    });


    socket.on("disconnect2", async () => { 

        
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

// // The setupWorker method provided by the @socket.io/sticky will take care of the synchronization 
// // between the master and the worker.
// // https://npm.io/package/@socket.io/sticky
// setupWorker(io);

setupWorker(io);