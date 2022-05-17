import React, { useState } from 'react';
import "./Modal.scoped.css";

function Modal(props){
    const { open, close, sec, header } = props;

    return(
    <div className={open ? 'openModal modal' : 'modal'}>
        {open ? (
            <section>
            <header>
                {header}
                <button className="close" onClick={close}>
                &times;
                </button>
            </header>
            <main>{props.children}</main>
            <h2>{sec} sec.</h2>
            <footer>
                <button className="close" onClick={close}>
                close
                </button>
            </footer>
            </section>
        ) : null}
    </div>
    )
}

export default Modal;