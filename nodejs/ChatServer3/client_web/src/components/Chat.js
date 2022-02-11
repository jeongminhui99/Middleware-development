import React, { Component, useEffect, useState } from 'react';
import socket from "../socket";
import User from "./User";
import MessagePanel from "./MessagePanel";
import "./Chat.scoped.css";

const Chat = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    //const [selectedm, setSelectedm] = useState({id:"fff", ff:[{d:"ddd"}]});
    const [users, setUsers] = useState([]);


    socket.on("connect", () => {
        console.log("clientconnect");
        users.forEach((user) => {
            if (user.self) {
                user.connected = true;
            }
        });
    });
      
    socket.on("disconnect", () => {
        users.forEach((user) => {
            if (user.self) {
                user.connected = false;
            }
        });
    });

    socket.on("users", (userss) => {
        userss.forEach((user) => {
            console.log("user : ", user);
            for (let i = 0; i < users.length; i++) {
                const existingUser = users[i];
                if (existingUser.userID === user.userID) {
                    existingUser.connected = user.connected;
                    return;
                }
            }
            user.self = user.userID === socket.userID;
            //user.self = user.userID === socket.id; 
            initReactiveProperties(user);
            users.push(user);
        });
        // put the current user first, and sort by username
        var userstmp = []
        userstmp = userss.sort((a, b) => {
            if (a.self) return -1;
            if (b.self) return 1;
            if (a.username < b.username) return -1;
            return a.username > b.username ? 1 : 0;
        });
        setUsers(userstmp);
        console.log("userstmp : ", userstmp);
        
    });

    socket.on("user connected", (user) => {
        for (let i = 0; i < users.length; i++) {
            const existingUser = users[i];
            if (existingUser.userID === user.userID){
                existingUser.connected = true;
                return;
            }
        }
        initReactiveProperties(user);
        setUsers(users.concat(user));
        console.log("user connected : ", users);
        //users.push(user);
    });
  
    socket.on("user disconnected", (id) => {
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.userID === id) {
                user.connected = false;
                setUsers(users);
                break;
            }
        }
    });

    useEffect(()=> {
        socket.on("private message", ({ content, from, to }) => {
            console.log("content", content, selectedUser);       
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const fromSelf = socket.userID === from;
                if (user.userID === (fromSelf ? to : from)) {
                    console.log("content22", content, selectedUser);        
                    user.messages.push({
                        content,
                        fromSelf,
                    });  
                    if (user !== selectedUser) {
                        user.hasNewMessages = true;
                    }
                    break;
                }
            }
            setSelectedUser(null);
            setSelectedUser(selectedUser);
        });
        return () => {
            console.log("UNMOUNT")
            socket.off("private message");
        }
    });


    useEffect(() => {
        return () => {
            console.log("UNMOUNT")
            socket.off("connect");
            socket.off("disconnect");
            socket.off("users");
            socket.off("user connected");
            socket.off("user disconnected");
        }
    }, []);
  
    const initReactiveProperties = (user) => {
        //user.connected = true;
        user.messages = [];
        user.hasNewMessages = false;
    };

    const getSelectUser = (selectuser) => {
        setSelectedUser(selectuser);
        selectuser.hasNewMessages = false;
        console.log("selectuser : ", selectuser);
    }

    const onMessage = (content) => {
        console.log("onMessage : ", content, users, selectedUser);
        if(selectedUser){
            //console.log("selectedUser : ", selectedUser);
            socket.emit("private message", {
                content,
                to: selectedUser.userID,
            });

            selectedUser.messages.push({
                content,
                fromSelf: true,
            });
        }
    }
    // const onSelectUser = (user) => {
    //     setSelectedUser(user);
    //     user.hasNewMessages = false;
    // }

    return(
        <div>
            <div className="left-panel">
                {
                    users.map(user => (
                        <User user={user} key={user.userID} selected={selectedUser === user} getSelectUser={getSelectUser}/>
                    ))
                }
            </div>
            <div className="right-panel">
            
                {
                    selectedUser?
                    <MessagePanel user = {selectedUser} onMessage = {onMessage} className="right-panel"/> : null
                }

            </div>
        </div>
    );
}

export default Chat;