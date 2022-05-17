import React, { Component, useState } from 'react';
import "./StatusIcon.scoped.css";

export default function StatusIcon({ check }) {
    return (
        <i className={`${check ? 'connected' : ''} icon`}></i>
    );
}