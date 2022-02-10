
import React, { Component, useEffect, useState } from 'react';
import StatusIcon from "./StatusIcon";
import "./User.scoped.css";

const User = ({ user, selected, getSelectUser }) => {

    const [connect, setConnect] = useState("");

    const onClick = () => {
        console.log("click!!");
        getSelectUser(user);
    }

    useEffect(()=>{
        console.log(user.connected ? "online" : "offline");
        setConnect(user.connected ? "online" : "offline");
    },[user.connected]);

    return(
        <div className={`${selected ? 'selected' : ''} user`} onClick={onClick}> 
            <div className="description">
                <div className="name">
                    { user.username } { user.self ? " (yourself)" : "" }
                </div>
                <div className="status">
                    <StatusIcon connected={user.connected}/> { connect }
                </div>
            </div>
            {user.hasNewMessages ? <div className="new-messages">!</div> :  null}
        </div>
    );
}
export default User;
