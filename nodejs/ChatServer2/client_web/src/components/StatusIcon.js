import React, { Component, useState } from 'react';
import "./StatusIcon.scoped.css";

export default function StatusIcon({
    connected
}) {

    // const [connect, setConnect] = useState(false);
    // setConnect(connected);

    return(
        <i className={`${connected ? 'connected' : ''} icon`}></i>
    );
}