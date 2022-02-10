import React, { Component, useEffect, useState } from 'react';
import "./App.css";
import socket from "./socket";
import SelectUsername from "./components/SelectUsername";
import Chat from "./components/Chat";

export default function App() {
    const [username, setUsername] = useState('');
    const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);

    React.useEffect(() => {
        return () => {
            console.log("UNMOUNT")
            socket.off("connect_error");
        }
    }, []);

    useEffect(()=>{

        socket.on("connect_error", (err) => {
            if (err.message === "invalid username") {
            this.usernameAlreadySelected = false;
            }
        });
    })

    const getData = (username) => {
        setUsername(username);
        console.log(username);
        setUsernameAlreadySelected(true);
        socket.auth = { username };
        socket.connect();
    }

    return(
        <div id="app">
            {!usernameAlreadySelected? <SelectUsername username={username} getData={getData}/> : <Chat/>}
        </div>
    );
}
