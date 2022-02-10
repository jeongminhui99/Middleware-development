const express = require("express");
const http = require("http");
const path = require("path");
const bodyPaser = require('body-parser');
const socketio = require("socket.io");
const cors = require("cors");

const cluster = require("cluster");
const { Server } = require("socket.io");
const numCPUs = require("os").cpus().length;
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");


// if (cluster.isMaster) {
//     console.log(`Master ${process.pid} is running`);
  
//     const httpServer = http.createServer();
  
//     // setup sticky sessions
//     setupMaster(httpServer, {
//       loadBalancingMethod: "least-connection",
//     });
  
//     // setup connections between the workers
//     setupPrimary();
  
//     // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
//     // Node.js < 16.0.0
//     cluster.setupMaster({
//       serialization: "advanced",
//     });
//     // Node.js > 16.0.0
//     // cluster.setupPrimary({
//     //   serialization: "advanced",
//     // });
  
//     httpServer.listen(7000);
  
//     for (let i = 0; i < 4; i++) {
//       cluster.fork();
//     }
  
//     cluster.on("exit", (worker) => {
//       console.log(`Worker ${worker.process.pid} died`);
//       cluster.fork();
//     });
//   } else {
//     console.log(`Worker ${process.pid} started`);
//     const app = express();
//     const httpServer = http.createServer(app);
//     const options = {
//         cors: true,
//         origin: ['http://1192.168.35.246:7000/'],
//     };

//     const io = socketio(httpServer, options);
  
//     // use the cluster adapter
//     io.adapter(createAdapter());
    
//     app.use(cors());
//     app.use(bodyPaser.json());
//     app.use(bodyPaser.urlencoded({extended: false}));
//     app.use(express.json());
//     app.use(express.static(path.join(__dirname, 'client_web/build')));

//     app.get('*', function(req, res){
//         res.sendFile(path.join(__dirname, '/client_web/build/index.html'));
//     })
  
//     // setup connection with the primary process
//     setupWorker(io);
  
//     io.on("connection", (socket) => {
//       /* ... */
//       console.log(socket.id);
//       console.log(`Worker ${process.pid}`);
//     });
//   }
  
//=======================================
const app = express();
const server = http.createServer(app);
const options = {
    cors: true,
    origin: ['http://192.168.0.13:7000/'],
};
//const io = socketio(server, options);

const io = socketio(server,{
    cors: {
        origin: 'https://192.168.35.25:7000',
        methods: ["GET", "POST"]
    }
});

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



