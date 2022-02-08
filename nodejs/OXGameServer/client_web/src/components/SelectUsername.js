import React, { Component, useState } from 'react';
import "./SelectUsername.scoped.css";

const SelectUsername = ({ username, getData }) => {
    const [isValid, setisValid] = useState(false); 
    const [finalname, setFinalname] = useState('');
    //onChange={e => setUsername(e.target.value)}
    
    const onSubmit = (event) => {
        event.preventDefault();
        //console.log(finalname);
        username = finalname
        getData(username);
    }


    const isvalid = (username) => {
        setFinalname(username);
        return username.length > 2;
    }

    return (
        <div className="select-username">
            <form onSubmit={onSubmit}>
                <input placeholder="Your username..." onChange={e => setisValid(isvalid(e.target.value))}/>
                <button disabled={!isValid}>Send</button>
            </form>
        </div>
    );
}

export default SelectUsername;
