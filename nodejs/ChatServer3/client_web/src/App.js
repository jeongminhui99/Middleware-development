import React, { Component, useEffect, useState } from 'react';
import "./App.css";
import socket from "./socket";
import SelectUsername from "./components/SelectUsername";
import Chat from "./components/Chat";
import Test from "./components/test";

export default function App() {
    //localStorage.clear();
    const [username, setUsername] = useState('');
    const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);
    //const [sessionID, setSessionID] = useState(localStorage.getItem("sessionID"));
    const sessionID = localStorage.getItem("sessionID");


    const getData = (username) => { //onUsernameSelection
        setUsername(username);
        console.log(username);
        setUsernameAlreadySelected(true);
        socket.auth = { username };
        socket.connect();
    };


    if (sessionID) { // 새로고침 시 바로 chat으로 넘어감
        console.log("session있음");
        if (usernameAlreadySelected === false){
            setUsernameAlreadySelected(true);
        }
;       //setUsernameAlreadySelected(true);
        socket.auth = { sessionID };
        socket.connect();
    };

    // useEffect(() => {
    //     socket.on("session", ({ sessionID, userID }) => {
    //         console.log("session");
    //         // attach the session ID to the next reconnection attempts
    //         socket.auth = { sessionID };
    //         // store it in the localStorage
    //         localStorage.setItem("sessionID", sessionID);
    //         setSessionID(sessionID);
    //         // save the ID of the user
    //         socket.userID = userID;
    //     });
    // }, []);
    
    socket.on("session", ({ sessionID, userID }) => {
        console.log("session");
        // attach the session ID to the next reconnection attempts
        socket.auth = { sessionID };
        // store it in the localStorage
        localStorage.setItem("sessionID", sessionID);
        // save the ID of the user
        socket.userID = userID;
    });

    socket.on("connect_error", (err) => {
        if (err.message === "invalid username") {
            setUsernameAlreadySelected(false);
        }
    });

    useEffect(() => {
        return () => {
            console.log("UNMOUNT")
            socket.off("connect_error");
        }
    }, []);

    // useEffect(()=>{

    //     socket.on("connect_error", (err) => {
    //         if (err.message === "invalid username") {
    //         this.usernameAlreadySelected = false;
    //         }
    //     });
    // })

    return(
        <div id="app">
            {!usernameAlreadySelected? <SelectUsername username={username} getData={getData}/> : <Chat/> }
        </div> 

    );
}
