const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const router = express.Router();
var rspRouter = require('./routes/rsp2');
var testRouter = require('./test');


const redis = require("redis");
const redisAdapter = require('socket.io-redis');
const { reset } = require("nodemon");
var pub = redis.createClient(6379, '127.0.0.1');
var sub = redis.createClient(6379, '127.0.0.1');

pub.on('error', (err) => console.log(err));
sub.on('error', (err) => console.log(err));

sub.subscribe("chat");

const app = express();

const server = http.createServer(app);

// app.use(express.static(path.join(__dirname, "public")));
// app.use("/rsp", rspRouter);

// if (process.argv.length < 3){
//     console.log('ex) node app <port>');
//     process.exit(1);
// }
// server.listen(process.argv[2]);

// console.log(process.argv[2] +' Server Started!! ')

const io = socketio(server);


io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
app.use(express.static(path.join(__dirname, "public")));
//app.use("/test", testRouter);
//app.use("/rsp", rspRouter);

if (process.argv.length < 3){
    console.log('ex) node app <port>');
    process.exit(1);
}
server.listen(process.argv[2]);
console.log(process.argv[2] +' Server Started!! ')

// var gameserver = io.of('/game');
// gameserver.on('connection', function(socket){
//     console.log("User = " + socket.id);
// });

io.sockets.on('connection', function (socket) {
    app.set('socketio', io);
    console.log("socket id : " + socket.id + " connected !!!");

    socket.on('game', function(data, res){
        //console.log("Got 'gamechoice' from android , " + data);
        if(data == "rsp"){
            console.log("Got 'gamechoice' from android , " + data);
            require("./rsp.js")(socket);
            // var test = require("./test.js")(io);
            // test(); // Module! 출력
        }
        else if(data == "updown"){
            console.log("Got 'gamechoice' from android , " + data);
            require("./updown.js")(socket);
        }

    });
});

//app.use("/test", testRouter);
app.use("/rsp", rspRouter);

// const rooms = {};
// const connectedUsers = {};
// const choices = {};
// const moves = {
//     "rock": "scissor",
//     "paper": "rock",
//     "scissor": "paper"
// };
//  Game variables
// let canChoose = false;
// let playerOneConnected = false;
// let playerTwoIsConnected = false;
// let playerId = 0;
// let myChoice = "";
// let enemyChoice = "";
// let roomId = "";
// let myScorePoints = 0;
// let enemyScorePoints = 0;

// io.sockets.on('connection', function (socket) {

//   console.log("socket id : " + socket.id + " connected !!!");
//   socket.join("chat");

//   socket.on('message', function(data){
//     //data = JSON.parse(data);
//     console.log("Got 'sendMessage' from client , " + JSON.stringify(data));
//     //socket.broadcast.emit('message', data.msg);
//     socket.to("chat").emit('message', data.msg);
//     //pub.publish('message', JSON.stringify(data));
//   });
//   // socket.on('finish', function(data){
    
//   // });

//   socket.on('android', function(data){
//     console.log("Got 'sendMessage' from android , " + data);
//     socket.to("chat").emit('message', "This is from android : " + data);
//   });

//   socket.on('create', function(data){
//     console.log("Got 'sendMessage' from android , create room name : " + data);
//     console.log("clientId : " + socket.client.id);
//     socket.to("chat").emit('message', "create room name : " + data);

//     if(rooms[data]){
//         const error = "This room already exists";
//         socket.emit("error", error);
//     }else{
//         connectedUsers[socket.client.id] = true;
//         rooms[data] = [socket.client.id, ""];

//         //socket.emit("room-created", data);
//         playerId = 1;
//         roomId = data;
    
//         //setPlayerTag(1)
//         socket.emit("room-created", roomId);
        
//         socket.emit("player-1-connected");
//         //playerJoinTheGame(1);
//         playerOneConnected = true;

//         socket.join(data);
//     }
//   });


//   socket.on('join', function(data){
//     console.log("Got 'sendMessage' from android , join room name : " + data);
//     console.log("clientId : " + socket.client.id);
//     socket.to("chat").emit('message', "join room name : " + data);

//     if(!rooms[data]){
//         const error = "This room doen't exist";
//         socket.emit("error", error);
//     }else{
//         connectedUsers[socket.client.id] = true;
//         rooms[data][1] = socket.client.id;
//         socket.join(data);

//         socket.emit("room-joined", data);
//         playerId = 2;
//         roomId = data;

//         // playerOneConnected = true;
//         // socket.emit("player-1-connected"); //playerJoinTheGame(1)
//         // socket.emit("room-created", playerId); //setPlayerTag(2);
//         // socket.emit("wait", false); //setWaitMessage(false);


//         socket.emit("player-2-connected"); //playerJoinTheGame(2)
//         // playerTwoIsConnected = true
//         // canChoose = true;
//         //socket.emit("wait", false); //setWaitMessage(false);
//         socket.broadcast.to(data).emit("player-2-connected");
//         choices[data] = ["", ""]
//     }
//   });

//   socket.on('make-move', function(data){
//     console.log("Got 'sendMessage' from android , make-move : " + data.choice);
//     console.log("roomId : " + data.roomId + ", playerId : " + data.playerId);
//     canChoose = false;
//     myChoice = data.choice;
//     roomId = data.roomId;
//     playerId = data.playerId;

//     if(choices[roomId]){
//         choices[roomId][playerId-1] = myChoice;
//     }

//     if(choices[roomId][0] !== "" && choices[roomId][1] !== ""){
//         let playerOneChoice = choices[roomId][0];
//         let playerTwoChoice = choices[roomId][1];

//         if(playerOneChoice === playerTwoChoice){
//             let message = "Both of you chose " + playerOneChoice + " . So it's draw";
//             io.to(roomId).emit("draw", message);
            
//         }else if(moves[playerOneChoice] === playerTwoChoice){
//             let enemyChoice = "";

//             if(playerId === "1"){
//                 enemyChoice = playerTwoChoice;
//             }else{
//                 enemyChoice = playerOneChoice;
//             }

//             io.to(roomId).emit("player-1-wins", {myChoice, enemyChoice});
//         }else{
//             let enemyChoice = "";

//             if(playerId === 1){
//                 enemyChoice = playerTwoChoice;
//             }else{
//                 enemyChoice = playerOneChoice;
//             }

//             io.to(roomId).emit("player-2-wins", {myChoice, enemyChoice});
//         }

//         choices[roomId] = ["", ""];
//     }
//   });

//   socket.on("leave", (data) => {
//     if(connectedUsers[socket.client.id]){
//         let player;
//         let roomId;

//         for(let id in rooms){
//             if(rooms[id][0] === socket.client.id || rooms[id][1] === socket.client.id){
//                 if(rooms[id][0] === socket.client.id){
//                     player = 1;
//                 }else{
//                     player = 2;
//                 }

//                 roomId = id;
//                 break;
//             }
//         }

//         if(player === 1){
//             delete rooms[roomId];
//         }else{
//             rooms[roomId][1] = "";
//         }
//         //exitRoom(roomId, player);

//         if(player === 1){
//             io.to(roomId).emit("player-1-disconnected");
//             reset()
//             socket.leave(roomId)
//         }else{
//             io.to(roomId).emit("player-2-disconnected");
//             reset()
//             canChoose = false;
//             enemyScorePoints = 0
//             myScorePoints = 0
//             playerTwoIsConnected = false;
//             socket.leave(roomId)
//         }
//     }
//   });

//   socket.on('leaves', function(data){
//     console.log("Got 'sendMessage' from android , leave room name : " + data);
//     console.log("clientId : " + socket.client.id);
//     socket.to("chat").emit('message', "exit room name : " + data);


//   });


// });

// // Functions

// function reset(){
//     canChoose = false;
//     playerOneConnected = false;
//     playerTwoIsConnected = false;
//     myScorePoints = 0
//     enemyScorePoints = 0

// }