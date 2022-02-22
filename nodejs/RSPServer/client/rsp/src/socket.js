import { io } from "socket.io-client";

const URL = "http://localhost:8080";
//const socket = io(URL);
//const socket = io(URL, { autoConnect: false,  transports: ["websocket"]});
const socket = io(URL, {transports: ["websocket"]});
socket.onAny((event, ...args) => {
  console.log("event : ", event, args);
});

export default socket;