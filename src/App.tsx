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
  let latestStateRef = React.useRef({ state, dirty: false });
  let debouncedSaveRef = React.useRef(debounce(
    () => {
      saveState(latestStateRef.current.state);
      latestStateRef.current.dirty = false;
    },
    5000,
    { trailing: true, leading: false },
  ));

  // save state before closing the page
  React.useEffect(() => {
    window.onbeforeunload = () => {
      // save only if state changed since last last auto-save
      if (latestStateRef.current.dirty) {
        saveState(latestStateRef.current.state);
      }
    };
    return () => { window.onbeforeunload = null; };
  });

  const updateStateWithFunction = (updateFunction: StateUpdateFunction) => {
    let newState = updateFunction(state);
    latestStateRef.current.state = newState;
    latestStateRef.current.dirty = true;
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
