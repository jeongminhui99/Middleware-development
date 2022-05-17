import React, { Component, useEffect, useState } from 'react';
import StatusIcon from "./StatusIcon";
import "./Player_ready.scoped.css";

function Player_reday(props) {
    const [isMe, SetisMe] = useState(false);
    // if (props.value == props.player) {
    //     console.log("it's me : ", props.value, props.player, isMe);
    // } else {
    //     console.log("it's not me : ", props.value, props.player, isMe);
    // }

    useEffect(() => {
        if (props.value == props.player) {
            SetisMe(true);
            console.log("use it's me : ", props.value, props.player, isMe);
        } else {
            SetisMe(false);
            console.log("use it's not me : ", props.value, isMe);
        }
    }, [isMe]);

    return(
        <div>
            <StatusIcon check={isMe}/>
            player {props.idx + 1}: {props.value}
            {isMe? '(me)' : null}
        </div>
    )
}

export default Player_reday;