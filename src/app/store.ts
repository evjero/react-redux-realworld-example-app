import {
  AnyAction,
  AsyncThunkAction,
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import commentsReducer from '../features/comments/commentsSlice';
import tagsReducer from '../features/tags/tagsSlice';
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
});

const store = configureStore({
  reducer: rootReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(localStorageMiddleware),
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
