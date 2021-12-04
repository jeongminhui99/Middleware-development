const express = require("express");
const http = require("http");
const path = require("path");
const router = express.Router();
var rspRouter = require('./routes/rsp');
var testRouter = require('./routes/test');

const app = express();

const server = http.createServer(app);
//app.use(express.static(path.join(__dirname, "public")));
app.use("/test", testRouter);
app.use("/rsp", rspRouter);

if (process.argv.length < 3){
    console.log('ex) node app <port>');
    process.exit(1);
}
server.listen(process.argv[2]);

console.log(process.argv[2] +' Server Started!! ')