import { debounce, DebouncedFunc } from 'lodash';
import React from 'react';
import { deserializeState, serializeState, State, useState } from './state';

// How much time must pass after resync to initiate another resync.
const RESYNC_INTERVAL_MS = 2 * 60 * 1000;

// How often to check if it's time for resync.
const RESYNC_CHECK_INTERVAL_MS = 5 * 1000;

// How much time to wait (for more updates) before sending state to the server.
const UPDATE_DEBOUNCE_WAIT_MS = 1 * 1000;

// Data necessary for saving state on a server.
export type Sync = {
    // URL of the sync server, without trailing slash, e.g. 'http://localhost:8000'.
    storageUrl: string,
    // JWT auth token that will be passed to the server in 'Authorization: Bearer (TOKEN)` header.
    authToken: string,
    // Version of the state stored on a client.
    version: number,
    // Whether state has been modified since the last successful save.
    dirty: boolean,
    // Whether the client is currently saving state on the server.
    saving: boolean,
};

export type OptionalSync = Sync | null;

export type Status = 'off' | 'syncing' | 'synced' | 'dirty' | 'error';

// By default syncing is disabled.
export const initialSync: OptionalSync = null;

export function serializeSync(sync: OptionalSync): string {
    return JSON.stringify(sync);
}

export function deserializeSync(syncString: string): OptionalSync {
    let obj = JSON.parse(syncString);
    return obj;
}

function sendStateToServer(state: State, sync: Sync): Promise<number> {
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

function getStateFromServer(sync: Sync): Promise<[number, State] | null> {
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

function retrieveSync(): OptionalSync {
    let sync = window.localStorage.getItem('sync');
    if (sync) {
        return deserializeSync(sync);
    }
    persistSync(initialSync);
    return initialSync;
}

function persistSync(sync: OptionalSync) {
    window.localStorage.setItem('sync', serializeSync(sync));
}

const syncContext = React.createContext({ status: 'off' as Status });

export function SyncProvider(props: { children: any }) {
    let { children } = props;
    let [sync] = React.useState(retrieveSync);

    return (
        (sync !== null)
            ? (<SyncProviderInner initSync={sync}>{children}</SyncProviderInner>)
            : (<syncContext.Provider value={{ status: 'off' }}>{children}</syncContext.Provider>)
    );
}

export function SyncProviderInner(props: { initSync: Sync, children: any }) {
    const { initSync, children } = props;

    const { state, updateState } = useState();
    const latestStateRef = React.useRef(state);

    const syncRef = React.useRef(initSync);

    // Ref to function that should be called whenever state changes.
    // When it's null we're syncing with server.
    const handleStateUpdateRef = React.useRef<DebouncedFunc<() => void> | null>(null);

    // Status to share in context.
    const [status, setStatus] = React.useState<Status>('off');

    // Ref to time of the last resync attempt.
    const lastResyncRef = React.useRef(new Date());

    // Ref saying whether the component is still mounted.
    const mountedRef = React.useRef(true);

    // Ref to function that syncs state with server and initializes update handler.
    const syncWithServerRef = React.useRef(() => {
        if (!mountedRef.current) return;

        setStatus('syncing');
        getStateFromServer(syncRef.current)
            .then(versionAndState => {
                if (!mountedRef.current) return;

                if (versionAndState) {
                    const [serverVersion, serverState] = versionAndState;

                    // Optimistically assume server handled "saving" successfully.
                    if (syncRef.current.saving) {
                        syncRef.current.saving = false;
                        syncRef.current.version += 1;

                        // If the server is behind, "saving" did not succeed.
                        if (syncRef.current.version > serverVersion) {
                            syncRef.current.dirty = true;
                            syncRef.current.version -= 1;
                        }
                    }

                    // Server is behind, it's probably a bug in client
                    if (syncRef.current.version > serverVersion) {
                        throw new Error("Server is behind client. Either a bug or storage rollback.");
                    }
                    // Client and server are on the same version.
                    // No other client has modified state when we weren't looking.
                    else if (syncRef.current.version === serverVersion) {
                        // Ok.
                    }
                    // Client is behind server and we can fast forward because state isn't dirty.
                    else if (syncRef.current.version < serverVersion && !syncRef.current.dirty) {
                        syncRef.current.version = serverVersion;

                        latestStateRef.current = serverState;
                        updateState(() => serverState);
                    }
                    // Client is behind but state is dirty so we can't fast forward.
                    else {
                        throw new Error("State is dirty and can not be fast-forwarded.")
                    }
                }
            })
            .then(() => {
                if (!mountedRef.current) return;

                persistSync(syncRef.current);

                handleStateUpdateRef.current = createStateUpdateHandler();

                // if there are changes waiting, send them immediately
                if (syncRef.current.dirty) {
                    handleStateUpdateRef.current?.();
                    handleStateUpdateRef.current?.flush();
                } else {
                    setStatus('synced');
                }
            })
            .catch(error => {
                if (!mountedRef.current) return;

                console.error("Initializing sync failed.");
                console.error(error);

                handleStateUpdateRef.current = createResyncingStateUpdateHandler();
                setStatus('error');
            });
    });

    // Debounce saving state on every change.
    function createStateUpdateHandler() {
        return debounce(
            () => {
                if (!mountedRef.current) return;

                // stop update handler
                handleStateUpdateRef.current?.cancel();
                handleStateUpdateRef.current = null;

                syncRef.current.saving = true;
                syncRef.current.dirty = false;
                persistSync(syncRef.current);
                setStatus('syncing');

                return sendStateToServer(latestStateRef.current, syncRef.current)
                    .then(version => {
                        if (!mountedRef.current) return;

                        syncRef.current.saving = false;
                        syncRef.current.version = version;
                        persistSync(syncRef.current);

                        handleStateUpdateRef.current = createStateUpdateHandler();
                        if (syncRef.current.dirty) {
                            handleStateUpdateRef.current?.();
                            setStatus('dirty');
                        } else {
                            setStatus('synced');
                        }
                    })
                    .catch(error => {
                        if (!mountedRef.current) return;

                        syncRef.current.saving = false;
                        syncRef.current.dirty = true;
                        persistSync(syncRef.current);

                        console.error("Failed to send state to server.");
                        console.error(error);

                        handleStateUpdateRef.current = createStateUpdateHandler();
                        setStatus('error');
                    });
            },
            UPDATE_DEBOUNCE_WAIT_MS,
            { trailing: true, leading: false },
        );
    }

    function createResyncingStateUpdateHandler() {
        return debounce(
            () => {
                if (!mountedRef.current) return;

                handleStateUpdateRef.current?.cancel();
                handleStateUpdateRef.current = null;

                syncWithServerRef.current();
            },
            UPDATE_DEBOUNCE_WAIT_MS,
            { trailing: true, leading: false },
        );
    }

    // react to change of state
    React.useEffect(() => {
        // if state change was not caused by fetch
        if (state !== latestStateRef.current) {
            latestStateRef.current = state;

            if (!syncRef.current.dirty) {
                syncRef.current.dirty = true;
                persistSync(syncRef.current);
            }

            // set status to dirty only if we aren't currently syncing
            if (handleStateUpdateRef.current !== null) {
                setStatus('dirty');
            }

            handleStateUpdateRef.current?.();
        }
    }, [state]);

    // sync with server on focus
    React.useEffect(() => {
        const resync = () => {
            // resync only if we aren't syncing
            if (handleStateUpdateRef.current !== null) {
                handleStateUpdateRef.current.cancel();
                handleStateUpdateRef.current = null;

                syncWithServerRef.current();

                lastResyncRef.current = new Date();
            }
        };
        window.addEventListener('focus', resync);
        return () => window.removeEventListener('focus', resync);
    }, []);

    // sync with server if last sync was more than 10 minutes ago
    React.useEffect(() => {
        const resync = () => {
            let now = new Date();
            // resync only if we aren't syncing and more than RESYNC_INTERVAL_MS passed
            if (handleStateUpdateRef.current !== null && now.getTime() - lastResyncRef.current.getTime() > RESYNC_INTERVAL_MS) {
                handleStateUpdateRef.current.cancel();
                handleStateUpdateRef.current = null;

                syncWithServerRef.current();

                lastResyncRef.current = now;
            }
        };

        const interval = window.setInterval(resync, RESYNC_CHECK_INTERVAL_MS);
        return () => window.clearInterval(interval);
    }, []);

    // start and stop syncing
    React.useEffect(() => {
        syncWithServerRef.current();
        return () => {
            mountedRef.current = false;
            handleStateUpdateRef.current?.cancel();
            handleStateUpdateRef.current = null;
        };
    }, []);

    return (
        <syncContext.Provider value={{ status }}>
            {children}
        </syncContext.Provider>
    );
}

export function useSync() {
    return React.useContext(syncContext);
}
