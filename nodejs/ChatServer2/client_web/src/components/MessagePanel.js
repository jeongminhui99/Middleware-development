import React, { Component, useEffect, useState } from 'react';
import StatusIcon from "./StatusIcon";
import "./MessagePanel.scoped.css";

const MessagePanel = ({ user, onMessage }) => {

    const [input, setInput] = useState("");
    const [finalmsg, setFinalmsg] = useState("");
    const [isValid, setisValid] = useState(false); 
    const [msg, setMsg] = useState([{}]);

    useEffect(()=>{
        setMsg(user.messages);
        console.log(msg);
    },[user.messages]);


    const onSubmit = (event) => {
        event.preventDefault();
        //console.log("msg : ", finalmsg);
        onMessage(finalmsg);
        setInput("");
        setFinalmsg("");
    }

    const displaySender = (message, index) => {
        return(
            index === 0 ||
            user.messages[index - 1].fromSelf !== 
            user.messages[index].fromSelf
        );
    }

    const isvalid = (msg) => {
        setFinalmsg(msg);
        return msg.length > 0;
    }

    return(
        <div>
            <div className="header">
                <StatusIcon connected={user.connected}/> { user.username }
            </div>        
            <ul className="messages">
                {
                    user.messages.map((message, index) => (
                        <li className="message">
                            {displaySender(message, index)? 
                                <div className="sender">
                                    { message.fromSelf ? "(yourself)" : user.username }
                                </div>
                                :
                                null
                            }
                            {message.content}
                        </li>
                    ))
                }
            </ul>
            <form className="form" onSubmit={onSubmit}>
                <textarea placeholder="Your message..." onChange={e => setisValid(isvalid(e.target.value))} className="input" value={finalmsg}/>
                <button disabled={!isValid} className="send-button">Send</button>
            </form>
        </div>
    );
}
export default MessagePanel;