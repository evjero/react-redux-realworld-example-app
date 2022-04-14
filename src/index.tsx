import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';

import App from './components/App';
import store from './app/store';

createRoot(
  document.getElementById('root') ?? document.getElementsByName('body')[0]
).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>
);
// https://www.cypress.io/blog/2018/11/14/testing-redux-store/
/* istanbul ignore else */
//eslint-disable-next-line
//@ts-ignore
if (window.Cypress) {
  //eslint-disable-next-line
  //@ts-ignore
  window.store = store;
}
