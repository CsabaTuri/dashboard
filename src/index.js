import React from 'react';
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import { App, appReducer } from './app'
import recognizeUser from "./authentication/recognizeUser"
import localStorage from "./persistence/LocalStorage"
import './index.css';

const store = createStore(
  appReducer,
  { currentUser: recognizeUser(localStorage) },
  applyMiddleware(thunk)
)

store.subscribe(() => {
  console.log("redux state", store.getState())
});

ReactDOM.render(
  <App store={store}/>,
  document.getElementById('root')
);
