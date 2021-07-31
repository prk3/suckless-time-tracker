
// Data necessary for saving state on a server.
export type SyncNotNull = {
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

export type Sync = SyncNotNull | null;

// By default syncing is disabled.
export const initialSync = null;

export function serializeSync(sync: Sync): string {
    return JSON.stringify(sync);
}

export function deserializeSync(syncString: string): Sync {
    let obj = JSON.parse(syncString);
    return obj;
}
