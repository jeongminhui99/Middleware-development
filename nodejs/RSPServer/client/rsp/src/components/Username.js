import React, { Component, useState } from 'react';
import '../App.css';
import socket from "../socket";
import logo from '../logo.svg';


function Username(props){
//const Username = ({nickname, getNickname}) => {
    const [name, setName] = useState("");
    const [isValid, setisValid] = useState(false); 

    function sendName(event){
        event.preventDefault();
        props.getNickname(name);
        socket.connect();
        socket.emit("jsonTest", "OK");
    }

    const isvalid = (nickname) => {
        setName(nickname);
        return nickname.length > 2;
    }
  
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Rock Paper Scissors
                </p>
                <form onSubmit={sendName}>
                    <input placeholder="Your nickname..." onChange={e => setisValid(isvalid(e.target.value))}/>
                    &nbsp;<button disabled={!isValid}>Send</button>
                </form>
            </header>
        </div>
    )
}

export default Username;