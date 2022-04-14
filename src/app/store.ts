import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import { connectRouter, routerMiddleware } from 'connected-react-router';

import authReducer from '../features/auth/authSlice';
import commentsReducer from '../features/comments/commentsSlice';
import tagsReducer from '../features/tags/tagsSlice';
import history from './history';
import { localStorageMiddleware } from './middleware';
import articleReducer from '../reducers/article';
import articlesReducer from '../reducers/articleList';
import commonReducer from '../reducers/common';
import profileReducer from '../reducers/profile';

const rootReducer = combineReducers({
  article: articleReducer,
  articleList: articlesReducer,
  auth: authReducer,
  comments: commentsReducer,
  common: commonReducer,
  profile: profileReducer,
  tags: tagsReducer,
  // router: connectRouter(history),
});

export function makeStore(preloadedState?: Record<string, unknown>) {
  return configureStore({
    reducer: rootReducer,
    devTools: true,
    preloadedState,
    middleware: (getDefaultMiddleware) => [
      ...getDefaultMiddleware(),
      // routerMiddleware(history),
      localStorageMiddleware,
    ],
  });
}

const store = makeStore();
export type AppStore = typeof store;
export type StoreState = ReturnType<typeof store.getState>;
export type StoreDispatch = typeof store.dispatch;

export default store;
