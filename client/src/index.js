import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import app from './modules/app';
import auth from './modules/auth';
import registerServiceWorker from './registerServiceWorker';

import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import reduxThunk from 'redux-thunk';
import rootReducer from './rootReducer';

import { Provider } from 'react-redux';

const store = createStore(rootReducer, composeWithDevTools(
  applyMiddleware(reduxThunk),
  // other store enhancers if any
));

const token = localStorage.getItem('token');

if (token) {
    store.dispatch(auth.actions.loginUser());
}

ReactDOM.render(
    <Provider store={store}>
        <app.components.App />
    </Provider>, 
    document.getElementById('root')
);

registerServiceWorker();