import React, { Component, useState } from 'react';
import Game from './Game';
import gameicon from './game.png';
import "./Room.scoped.css"
import '../App.css';
import socket from '../socket';

function Room(props) {

    const [playroom, setPlayroom] = useState("");
    const [playroomAlreadySelected, setPlayroomAlreadySelected] = useState(false);
    const [isValid, setisValid] = useState(false); 
    const [name, setName] = useState(props.value);
    const sessionID = localStorage.getItem("sessionID");

    const onSubmit = (event) => {
        event.preventDefault();
        setPlayroomAlreadySelected(true);
    }

    function onCreate(){
        console.log("onCreate");
    }

    function SessionOut(){
        console.log("SessionOut");
        localStorage.removeItem("sessionID"); // 삭제해야 전페이지로 돌아감
        props.setNicknameAlreadySelected(false);
        socket.emit("sessionOut");
    }

    const isvalid = (room) => {
        setPlayroom(room);
        return room.length > 2;
    }

    socket.on("session", ({ sessionID, userID, username }) => {
        console.log("서버로부터 session: ", username);
        setName(username);
        // attach the session ID to the next reconnection attempts
    });
  

    return(
        <div className="App">
            {!playroomAlreadySelected? 
            <header className="App-header">
                <img src={gameicon} className="gameicon"/>
                <p>
                    Hello!! &nbsp;
                    {name} player
                </p>
                <form onSubmit={onSubmit}>
                    <input placeholder="Enter playroom..." onChange={e => setisValid(isvalid(e.target.value))}/>
                    <br/>
                    <button className="w-btn-neon2" disabled={!isValid}>Play</button>
                </form> 
                <form onSubmit={onCreate}>
                    <input placeholder="Enter playroom..." onChange={e => setisValid(isvalid(e.target.value))}/>
                    <br/>
                    <button className="w-btn-neon2" disabled={!isValid}>Play</button>
                </form> 
                <button className="w-btn-neon" onClick={SessionOut}>SESSION OUT</button>
            </header> : <Game value={playroom}/> }
        </div>
    )
}

export default Room;