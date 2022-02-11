
// import io from "socket.io-client";

// const namespace = "dynamic-web_OXGame";
// var client_socket = io.connect(`http://192.168.35.25:7000/${namespace}`, {
//     query: `ns=/${namespace}`,
//     reconnect: true,
//     resource: 'socket.io'
// });

// client_socket.connect();

// client_socket.on("connect", () => {
//     console.log(socket.id);
// })

// export default client_socket;

import { io } from "socket.io-client";

const URL = "http://localhost:5000";
const socket = io(URL, { autoConnect: false,  transports: ["websocket"]});

socket.onAny((event, ...args) => {
  console.log("event : ", event, args);
});

export default socket;
