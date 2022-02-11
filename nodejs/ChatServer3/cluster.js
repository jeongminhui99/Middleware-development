const cluster = require("cluster");
const express = require("express");
const http = require("http");
const path = require("path");
const bodyPaser = require('body-parser');
const cors = require("cors");
const { setupMaster } = require("@socket.io/sticky");

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client_web/build')));

app.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '/client_web/build/index.html'));
})

const WORKERS_COUNT = 4;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < WORKERS_COUNT; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });

  //const httpServer = http.createServer();
  setupMaster(server, {
    loadBalancingMethod: "least-connection", // either "random", "round-robin" or "least-connection"
  });
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () =>
    console.log(`server listening at http://localhost:${PORT}`)
  );
} else {
  console.log(`Worker ${process.pid} started`);
  require("./chatserver");
}