import React, { Component, useState } from 'react';
import paper from './paper.png';
import rock from './rock.png';
import scissors from './scissors.png';
import '../App.css';
import "./Game.scoped.css";

function Play(props) {

    function click(value) {
        console.log(value, " clicked!!");
    }
    return (
        <div>
                <div id="score" className="score">
                    <p>Player1: 0</p>
                    <p>Player2: 0</p>
                </div>

                <div>
                    <br/>
                    LEFT TIME : {}
                    <br/>
                </div>

                <div className="buttons">
                    <button id="rock" className="btn" value="rock" onClick={click("rock")}><img className="bn" src={rock}/></button>
                    <button id="paper" className="btn" value="paper" onClick={click("paper")}><img className="bn" src={paper}/></button>
                    <button id="scissors" className="btn" value="scissors" onClick={click("scissors")}><img className="bn" src={scissors}/></button>
	            </div>
                <button className="w-btn w-btn-indigo" type="button">OK!!</button>
                <div>
                    <br/>
                    Player2 Choice : {} <br/><br/>
                    Player1 Choice : {} <br/><br/>
                    Result : {}
                </div>

                <br/>

                <button className="w-btn w-btn-indigo" type="button">AGAIN</button>
                <button className="w-btn w-btn-indigo" type="button">FINISH GAME</button>
        </div>
    )
}

export default Play;