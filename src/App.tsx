import React from 'react';
import './App.css';
import { StateContext, initial, StateUpdateFunction, deserialize, State } from './state';
import { Tasks } from './tasks';
import { Week } from './week';
import { debounce } from 'lodash';

function restoreState() {
  let state = window.localStorage.getItem('state');
  if (state) {
    return deserialize(state);
  }
  saveState(initial);
  return initial;
}

function saveState(state: State) {
  window.localStorage.setItem('state', JSON.stringify(state));
}

export function App() {
  const [state, setState] = React.useState(restoreState);

  // force-update interface every minute
  const [, forceUpdate] = React.useReducer(() => ({}), {});
  let forceUpdateIntervalRef = React.useRef(0);
  React.useEffect(() => {
    forceUpdateIntervalRef.current = window.setInterval(forceUpdate, 60 * 1000);
    return () => window.clearInterval(forceUpdateIntervalRef.current);
  });

  // debounce saving state on every change
  let latestStateRef = React.useRef(state);
  let debouncedSaveRef = React.useRef(debounce(
    () => saveState(latestStateRef.current),
    5000,
    { trailing: true, leading: false },
  ));

  // save state before closing the page
  React.useEffect(() => {
    window.onbeforeunload = () => {
      // persist state only if local storage hasn't been cleared manually
      if (window.localStorage.getItem('state') !== null) {
        saveState(latestStateRef.current);
      }
    };
    return () => { window.onbeforeunload = null; };
  });

  const updateStateWithFunction = (updateFunction: StateUpdateFunction) => {
    let newState = updateFunction(state);
    latestStateRef.current = newState;
    debouncedSaveRef.current();
    setState(newState);
  };

  return (
    <StateContext.Provider value={{ state, update: updateStateWithFunction }}>
      <div className="App">
        <Tasks/>
        <Week/>
      </div>
      {/* <pre>
        <code>
          {JSON.stringify(state, null, 2)}
        </code>
      </pre> */}
    </StateContext.Provider>
  );
}
