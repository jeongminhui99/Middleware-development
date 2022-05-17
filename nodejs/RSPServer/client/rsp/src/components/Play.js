import React, { Component, useEffect, useState } from 'react';
import paper from './paper.png';
import rock from './rock.png';
import socket from '../socket';
import scissors from './scissors.png';
import Modal from './Modal.js';
import '../App.css';
import "./Game.scoped.css";

function Play(props) {
    const [me, Setme] = useState('');
    const [enemy, Setenemy] = useState('');
    const [sec, Setsec] = useState(5);
    const [left, Setleft] = useState(10);
    const [choice, Setchoice] = useState('');
    const [final_choice, Setfinalchoice] = useState('');
    const [player_choice, Setplayerchoice] = useState('');
    const [result, Setresult] = useState('');
     // useState를 사용하여 open상태를 변경한다. (open일때 true로 만들어 열리는 방식)
    const [modalOpen, setModalOpen] = useState(false);
    const IsGaming = localStorage.getItem("IsGaming");
    const [disable, Setdisable] = useState(false);



    if (left == 0) {
        Setleft(10);
        console.log("socket.emit : ", choice);
        socket.emit("rsp_choice", [choice, props.room]);
        //버튼 비활성화
        Setdisable(true);
    }


    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        localStorage.setItem("IsGaming", true);
        setModalOpen(false);
        socket.off("start");
    };

    function again() {

    }

    function finish() {
        localStorage.removeItem("IsGaming");
        localStorage.removeItem("roomID");
        socket.emit("finish_game", props.room);
        props.setPlayroomAlreadySelected(false);
    }

    socket.on("player_finish_game", (player) => {
        console.log("player_finish_game : ", player, "나감.");
        var tmp = props.all;
        props.setall(tmp.filter((element) => element !== player));
        localStorage.removeItem("IsGaming");
        props.setIsPlayerAlready(false);
    });

    const rsp = name => {
        console.log(name);
        Setchoice(name);
        //socket.emit("rsp_choice", [name, props.room]);
    };

    // function OK(){
    //     console.log("OK!");
    //     Setfinalchoice(choice);
    //     socket.emit("rsp_choice", final_choice);
    // }

    socket.on("player_choice", (enemy) => {
        console.log("enemy: ", enemy);
        Setplayerchoice(enemy);
        if (choice == enemy) {
            Setresult("비김");
        } else if ((choice == "rock" && enemy == "paper") || (choice == "paper" && enemy=="scissors") || (choice == "scissors" && enemy == "rock")){
            Setresult("lose");
        } else {
            Setresult("win");
        }
    });

    useEffect(() => {
        for(var p=0; p<props.all.length;p++){
            if (props.all[p] == props.player){
                Setme(props.player);
                console.log("gggg");
                socket.emit("play", [props.player, props.room]);
            } else {
                Setenemy(props.all[p]);
            }
        }
    }, []);

    useEffect(() => {
        socket.on("start", (res) => {
            //2명 다 들어온 것을 확인
            if (!IsGaming){
                openModal();
            }
        })
    });

    socket.on("ready_cnt", (t) => {
        Setsec(t); // 5sec count
        if (t == 0){
            closeModal();
        }
    })

    socket.on("start_cnt", (t) => {
        //console.log("start_cnt", t);
        if (t < 11) {
            Setleft(t);
        }
    })


    return (
        <div>
            <Modal open={modalOpen} close={closeModal} sec={sec} header="Game Start!!">
            The game will begin in five seconds.<br></br>
            Choose one of the rock, paper, scissors for the given time.
            </Modal>
                <div id="score" className='score'>
                    <p>{me}(me): 0</p>
                    <p>{enemy}: 0</p>
                </div>

                <div>
                    <br/>
                    LEFT TIME : {left}
                    <br/>
                </div>

                <div className="buttons">
                    <button disabled={disable} className='btn' type='button' value="rock" onClick={() => rsp("rock")}><img className="bn" src={rock}/></button>
                    <button disabled={disable} className="btn" type="button" value="paper" onClick={() => rsp("paper")}><img className="bn" src={paper}/></button>
                    <button disabled={disable} className="btn" type="button" value="scissors" onClick={() => rsp("scissors")}><img className="bn" src={scissors}/></button>
	            </div>
                {/* <button className="w-btn w-btn-indigo" type="button" onClick={OK}>OK!!</button> */}
                <div>
                    <br/>
                    {me}(me): {choice} <br/><br/>
                    {enemy}: {player_choice} <br/><br/>
                    Result : {result}
                </div>

                <br/>

                <button className="w-btn w-btn-indigo" type="button">AGAIN</button>
                <button className="w-btn w-btn-indigo" type="button" onClick={finish}>FINISH GAME</button>
        </div>
    )
}

export default Play;