import logo from './logo.svg';
import React, { Component, useState, useEffect } from 'react';
import Username from "./components/Username";
import Room from "./components/Room";
import socket from "./socket";
import './App.css';

function App() {

  const [nicknameAlreadySelected, setNicknameAlreadySelected] = useState(false);
  const [nickname, setNickname] = useState("");
  const sessionID = localStorage.getItem("sessionID");

  const getNickname = (username) => {
    setNickname(username);
    console.log("nickname : ", username);
    setNicknameAlreadySelected(true);
    socket.auth = { username };
    socket.connect();
  };

  if(sessionID){ // 이거 안하면 서버 재실행 할 때마다 session이 새로 생성됨
    console.log("App.js: sessionID 있음");
    if(nicknameAlreadySelected === false){
      setNicknameAlreadySelected(true);
    }
    socket.auth = { sessionID };
    socket.connect();
  }

  socket.on("session", ({ sessionID, userID }) => {
    console.log("서버로부터 session: ", sessionID);
    // attach the session ID to the next reconnection attempts
    socket.auth = { sessionID };
    // store it in the localStorage
    localStorage.setItem("sessionID", sessionID);
    // save the ID of the user
    socket.userID = userID;
  });

  socket.on("connect_error", (err) => { // 이 코드 없으면 새로운 세션이 계속 생성된다.
    if (err.message === "invalid username") {
        setNicknameAlreadySelected(false);
    }
  });

  useEffect(() => {
    return () => {
        console.log("UNMOUNT")
        socket.off("connect_error");
    }
  }, []);

  return (
    <div className="App">
      { !nicknameAlreadySelected? <Username getNickname={getNickname}/> : <Room setNicknameAlreadySelected={setNicknameAlreadySelected} value={nickname}/>}
    </div>
  );
}

export default App;
