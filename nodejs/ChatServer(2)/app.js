const express = require("express");
const http = require("http");
const path = require("path");
const bodyPaser = require('body-parser');
const socketio = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const options = {
    cors: true,
    origin: ['http://192.168.0.13:7000/'],
};
const io = socketio(server, options);

// const io = socketio(server,{
//     cors: {
//         origin: 'https://192.168.35.25:7000',
//         methods: ["GET", "POST"]
//     }
// });

require('./io-handler')(io);

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



