import React from 'react';
import './App.css';
import { StateContext, initialState, StateUpdateFunction, deserializeState, State, serializeState } from './state';
import { deserializeSync, initialSync, serializeSync, Sync, SyncNotNull } from './sync';
import { Tasks } from './tasks';
import { Week } from './week';
import { debounce } from 'lodash';

function retrieveState(): State {
  let state = window.localStorage.getItem('state');
  if (state) {
    return deserializeState(state);
  }
  persistState(initialState);
  return initialState;
}

function retrieveSync(): Sync {
  let sync = window.localStorage.getItem('sync');
  if (sync) {
    return deserializeSync(sync);
  }
  persistSync(initialSync);
  return initialSync;
}

function persistState(state: State) {
  window.localStorage.setItem('state', serializeState(state));
}

function persistSync(sync: Sync) {
  window.localStorage.setItem('sync', serializeSync(sync));
}

function sendStateToServer(state: State, sync: SyncNotNull): Promise<number> {
  return fetch(`${sync.storageUrl}/string/${sync.version + 1}`, {
    method: 'PUT',
    body: serializeState(state),
    headers: {
      'Authorization': `Bearer ${sync.authToken}`,
    },
  })
    .catch(_error => {
      throw new Error(`Request to store app state failed`);
    })
    .then(response => {
      if (response.status === 200) {
        return sync.version + 1;
      }
      else if (response.status === 401) {
        throw new Error('Unauthorized. Check authToken.');
      }
      else if (response.status === 409) {
        throw new Error('Conflict detected. You will have to resolve it manually.');
      }
      else {
        throw new Error(`Unexpected response status ${response.status}`);
      }
    });
}

function getStateFromServer(sync: SyncNotNull): Promise<[number, State] | null> {
  return fetch(`${sync.storageUrl}/string`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${sync.authToken}`,
    },
  })
    .catch(_error => {
      throw new Error(`Request to get app state failed`);
    })
    .then(response => {
      if (response.status === 200) {
        return response
          .text()
          .then(text => {
            let newlineIndex = text.indexOf('\n');
            let version = Number(text.substring(0, newlineIndex));
            let state = deserializeState(text.substring(newlineIndex + 1));
            return [version, state] as [number, State];
          });
      }
      else if (response.status === 401) {
        throw new Error('Unauthorized. Check authToken.');
      }
      else if (response.status === 404) {
        return null;
      }
      else {
        throw new Error(`Unexpected response status ${response.status}`);
      }
    });
}

export function App() {
  const [state, setState] = React.useState(retrieveState);
  const latestStateRef = React.useRef({ state, dirty: false });

  const syncRef = React.useRef({ sync: retrieveSync(), dirty: false });
  const syncPromiseRef = React.useRef(Promise.resolve());

  // Initialize synchronization.
  React.useEffect(() => {
    if (syncRef.current.sync) {
      syncPromiseRef.current = getStateFromServer(syncRef.current.sync)
        .then(versionAndState => {
          if (versionAndState) {
            let [serverVersion, serverState] = versionAndState;

            // Optimistically assume server handled "saving" successfully.
            if (syncRef.current.sync!.saving) {
              syncRef.current.sync!.saving = false;
              syncRef.current.sync!.version += 1;
              syncRef.current.dirty = true;

              // If the server is behind, "saving" did not succeed.
              if (syncRef.current.sync!.version > serverVersion) {
                syncRef.current.sync!.dirty = true;
                syncRef.current.sync!.version -= 1;
                syncRef.current.dirty = true;
              }
            }

            // Server is behind, it's probably a bug in client
            if (syncRef.current.sync!.version > serverVersion) {
              throw new Error("Server is behind client. Either a bug or storage rollback.");
            }
            // Client and server are on the same version.
            // No other client has modified state when we weren't looking.
            else if (syncRef.current.sync!.version === serverVersion) {
              // Ok.
            }
            // Client is behind server and we can fast forward because state isn't dirty.
            else if (syncRef.current.sync!.version < serverVersion && !syncRef.current.sync!.dirty) {
              syncRef.current.sync!.version = serverVersion;
              syncRef.current.dirty = true;
              latestStateRef.current.state = serverState;
              latestStateRef.current.dirty = false; // Is this correct?
              setState(serverState);
            }
            // Client is behind but state is dirty so we can't fast forward.
            else {
              throw new Error("State is dirty and can not be fast-forwarded.")
            }
          }
        })
        .then(() => {
          if (syncRef.current.sync!.dirty) {
            syncRef.current.sync!.saving = true;
            syncRef.current.sync!.dirty = false;
            persistSync(syncRef.current.sync!);
            syncRef.current.dirty = false;

            return sendStateToServer(latestStateRef.current.state, syncRef.current.sync!)
              .then(version => {
                syncRef.current.sync!.saving = false;
                syncRef.current.sync!.version = version;
                persistSync(syncRef.current.sync!);
                syncRef.current.dirty = false;
              })
              .catch(error => {
                syncRef.current.sync!.saving = false;
                syncRef.current.sync!.dirty = true;
                persistSync(syncRef.current.sync!);
                syncRef.current.dirty = false;
                console.error("Failed to send state to server.");
                console.error(error);
              })
          }
        })
        .catch(error => {
          console.error("Initializing sync failed.");
          console.error(error);
        })
    }
  }, []);

  // Debounce saving state on every change.
  let debouncedSaveRef = React.useRef(debounce(
    () => {
      persistState(latestStateRef.current.state);
      latestStateRef.current.dirty = false;

      if (syncRef.current.sync) {
        syncPromiseRef.current = syncPromiseRef
          .current
          .then(() => {
            syncRef.current.sync!.saving = true;
            syncRef.current.sync!.dirty = false;
            persistSync(syncRef.current.sync!);
            syncRef.current.dirty = false;

            return sendStateToServer(latestStateRef.current.state, syncRef.current.sync!)
              .then(version => {
                syncRef.current.sync!.saving = false;
                syncRef.current.sync!.version = version;
                persistSync(syncRef.current.sync!);
                syncRef.current.dirty = false;
              })
              .catch(error => {
                syncRef.current.sync!.saving = false;
                syncRef.current.sync!.dirty = true;
                persistSync(syncRef.current.sync!);
                syncRef.current.dirty = false;
                console.error("Failed to send state to server.");
                console.error(error);
              })
          });
      }
    },
    5000,
    { trailing: true, leading: false },
  ));

  // Persist state and sync before closing the page
  React.useEffect(() => {
    window.onbeforeunload = () => {
      // Don't persist if not dirty. Otherwise we would override user's changes.
      if (latestStateRef.current.dirty) {
        persistState(latestStateRef.current.state);
      }
      if (syncRef.current.dirty) {
        persistSync(syncRef.current.sync);
      }
    };
    return () => { window.onbeforeunload = null; };
  }, []);

  // Force-update interface every minute when user is inactive.
  const [, forceUpdate] = React.useReducer(() => ({}), {});
  let forceUpdateIntervalRef = React.useRef(0);
  React.useEffect(() => {
    forceUpdateIntervalRef.current = window.setInterval(forceUpdate, 60 * 1000);
    return () => window.clearInterval(forceUpdateIntervalRef.current);
  });

  const updateStateWithFunction = (updateFunction: StateUpdateFunction) => {
    let newState = updateFunction(state);
    latestStateRef.current.state = newState;
    latestStateRef.current.dirty = true;
    if (syncRef.current.sync) {
      syncRef.current.sync.dirty = true;
      syncRef.current.dirty = true;
    }
    debouncedSaveRef.current();
    setState(newState);
  };

  return (
    <StateContext.Provider value={{ state, update: updateStateWithFunction }}>
      <div className="App">
        <Tasks />
        <Week />
      </div>
      {/* <pre>
          <code>
            {JSON.stringify(state, null, 2)}
          </code>
        </pre> */}
    </StateContext.Provider>
  );
}
