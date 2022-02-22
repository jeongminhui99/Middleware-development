import React, { Component, useState } from 'react';
import Player from './Player';
import socket from '../socket';
import '../App.css';
import "./Game.scoped.css";
import Play from './Play';

function Game(props) {
    const [isPlayerAlready, setIsPlayerAlready] = useState(false);

    return (
        <div>
            <div className="left-panel">
                <h2 className="roomname">{props.value} Room</h2>
                <Player/>
            </div>

            <div className="right-panel">
                {!isPlayerAlready? 
                <h1> waiting.... </h1>
                : <Play/>}
            </div>
        </div>

    )
}

export default Game;