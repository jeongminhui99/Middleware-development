import React, { Component, useEffect, useState } from 'react';
import Player_ready from './Player_ready';
import socket from '../socket';
import Room from './Room';
import '../App.css';
import "./Game.scoped.css";
import Play from './Play';

function Game(props) {
    const [isPlayerAlready, setIsPlayerAlready] = useState(false);
    const [playroomleave, setPlayroomleave] = useState(false);
    const [players, setPlayers] = useState([]);

    //socket.join(props.value);

    const leave = (event) => {
        event.preventDefault();
        setPlayroomleave(true);
        localStorage.removeItem("roomID"); // 삭제해야 전페이지로 돌아감
        socket.emit("leave_playroom", props.value);
        props.setPlayroomAlreadySelected(false);
    }


    useEffect(() => {
        console.log(players.length);
        if (players.length == 2){
            setIsPlayerAlready(true);
        }
    });

    
    socket.on("players", (players_list) => {
        var namelist = []
        for (var i = 0; i < players_list.length; i++) {
            namelist.push(players_list[i][0]);
        }
        console.log("namelist: ", namelist, props.player);
        setPlayers(namelist);
    })

    socket.on("player connected", (player) => {
        setPlayers(players.concat(player));
        // console.log("player connected : ", player);
        // console.log("player connected list : ", players.concat(player));
    })

    return (
        <div>
            <div className="left-panel">
                <h2 className="roomname">{props.value} Room</h2>
                {
                    players.map((player, idx) => (
                        <Player_ready value={player} idx={idx} player={props.player}/>
                    ))
                }
            </div>

            <div className="right-panel">

                {!isPlayerAlready? 
                <div>
                <h1> waiting.... </h1>
                <button className="w-btn-neon" onClick={leave}>LEAVE ROOM</button>
                </div>
                : <Play player={props.player} all={players} setall={setPlayers} room={props.value} setPlayroomAlreadySelected={props.setPlayroomAlreadySelected} setIsPlayerAlready={setIsPlayerAlready}/>}
            </div> 
        </div>

    )
}

export default Game;