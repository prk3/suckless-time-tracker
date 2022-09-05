import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import { StateProvider } from './state';
import { SyncProvider } from './sync';

import './index.css';

declare global {
    function dbg<T>(a: T): T;
}

// @ts-ignore
global.dbg = function <T>(a: T) {
    console.log(a);
    return a;
};

ReactDOM.render(
    <React.StrictMode>
        <StateProvider>
            <SyncProvider>
                <App />
            </SyncProvider>
        </StateProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
