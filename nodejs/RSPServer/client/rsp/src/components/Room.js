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
    const [alert, setAlert] = useState(false);
    const sessionID = localStorage.getItem("sessionID");
    const roomID = localStorage.getItem("roomID");

    if(roomID){
        console.log("roomID:", roomID);
        if (playroomAlreadySelected == false){
            setPlayroom(roomID);
            socket.auth = { sessionID };
            socket.connect();
            //player가 목록을 Game.js로 전달하기 위해 
            //socket.join(roomID);
            socket.emit("players_list", roomID);
            setPlayroomAlreadySelected(true);
        }
    }

    const error_alert = (event) => {
        return alert === false ? 'alert-hidden' : 'alert';
    }

    const onSubmit = (event) => {
        event.preventDefault();
        setPlayroomAlreadySelected(true);
        localStorage.setItem("roomID", playroom);
        socket.emit("join_playroom", playroom);
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

    socket.on("join_res", (res) => {
        console.log("join_res ; ", res);
        if (res == 0) { // 방 인원 초과
            setAlert(true);
            setPlayroomAlreadySelected(false);
        }
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
                    <br/><br/>
                    <div className={error_alert()}>
                        해당 방은 이미 꽉 찼습니다.
                    </div>
                    <br/>
                    <button className="w-btn-neon2" disabled={!isValid}>Play</button>
                </form> 
                {/* <form onSubmit={onCreate}>

                    <input placeholder="Enter playroom..." onChange={e => setisValid(isvalid(e.target.value))}/>
                    <br/>
                    <button className="w-btn-neon2" disabled={!isValid}>Play</button>
                </form>  */}
                <button className="w-btn-neon" onClick={SessionOut}>SESSION OUT</button>
            </header> : <Game setPlayroomAlreadySelected={setPlayroomAlreadySelected} value={playroom} player={name}/> }
        </div>
    )
}

export default Room;

