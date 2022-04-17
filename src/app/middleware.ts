import { Dispatch } from 'react';
import { AnyAction, Middleware } from 'redux';
import agent from '../agent';
import { login, logout, register } from '../features/auth/authSlice';

export const localStorageMiddleware: Middleware =
  (_store) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
    switch (action.type) {
      case register.fulfilled.type:
      case login.fulfilled.type:
        /*
         * This usage of JWT in localStorage should never be done in production environments...
         * @see https://gist.github.com/samsch/0d1f3d3b4745d778f78b230cf6061452
         */
        window.localStorage.setItem('jwt', action.payload.token);
        agent.setToken(action.payload.token);
        break;

      case logout.type:
        window.localStorage.removeItem('jwt');
        agent.setToken(undefined);
        break;
    }

    return next(action);
  };
