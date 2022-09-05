import React from 'react';
import { Tasks } from './tasks';
import { Week } from './week';

export function App() {
    // Force-update interface every minute when user is inactive.
    const [, forceUpdate] = React.useReducer(() => ({}), {});

    React.useEffect(() => {
        const interval = window.setInterval(forceUpdate, 60 * 1000);
        return () => window.clearInterval(interval);
    }, []);

    React.useEffect(() => {
        window.addEventListener('focus', forceUpdate);
        return () => window.removeEventListener('focus', forceUpdate);
    }, []);

    return (
        <div className="App">
            <Tasks />
            <Week />
        </div>
    );
}
