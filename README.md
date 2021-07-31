# Suckless time tracker

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## How to

### Backup time tracking data

The time tracking data is saved in `localStorage` under `state` key.

```javascript
localStorage.getItem('state')
```

You can copy it and store anywhere you like.
To restore saved state, set `state` item and refresh browser.

```javascript
localStorage.setItem('state', '(YOUR_BACKUP_STATE_HERE)')
```

### Enable syncing

Syncing it totally optional. To use it, you have to host a backend with the following API:

- GET /string - Retrieves the most recent state for authenticated user. Returns:
  - 200 with version + newline + state in body if user has saved state, e.g. "53\n{"tasks":[],"events":[]}"
  - 404 if user hasn't saved state
- PUT /string/(version) - Persists state if the passed version is newer than already saved. Returns:
  - 200 when state was saved correctly
  - 409 when server has the same or newer version of state

All endpoints are protected with JWT authentication. The server checks "Authorization: Bearer (token)" header and uses `user` integer property of token's claims to identify user. When token is not valid, the server should return 401 response.

To enable syncing, we'll upload state from one client to the server with this code:

```javascript
localStorage.setItem('sync', JSON.stringify({
  authToken: '<YOUR_TOKEN_HERE>', // e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxMCwiZXhwIjoxNTE2MjM5MDIyfQ.HD1tPARxtsBHeKzyUrwM6UVLacxhe8K2dVy-piLsj-E'
  storageUrl: '<STORAGE_URL_WITHOUT_TRAILING_SLASH>', // e.g. 'http://localhost:8000'
  version: 0,
  dirty: true,
  saving: false,
}));
```

Refresh the page and check if there aren't any errors in the console.

On other computers run this code to pull data from the server.

```javascript
localStorage.setItem('sync', JSON.stringify({
  authToken: '<YOUR_TOKEN_HERE>',
  storageUrl: '<STORAGE_URL_WITHOUT_TRAILING_SLASH>',
  version: 0,
  dirty: false,
  saving: false,
}));
```

Refresh the page to pull data from the server.

From now on, changes made on one machine will be sent to the server and loaded on other computers **ON PAGE REFRESH**. Remember that concurrent edits will desynchronize state and need manual fixing. Wait a bit between making changes and closing the app. If the app doesn't synchronize state before closing, edits from another computer will cause conflicts.

### Force-Pull state

```javascript
localStorage.setItem('sync', JSON.stringify((sync => ({
  ...sync,
  version: 0,
  dirty: false,
  saving: false,
}))(JSON.parse(localStorage.getItem('sync')))));
```

And then refresh.

### Force-Push state

```javascript
localStorage.setItem('sync', JSON.stringify((sync => ({
  ...sync,
  version: sync.version + 10000,
  dirty: true,
  saving: false,
}))(JSON.parse(localStorage.getItem('sync')))));
```

And then refresh.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
