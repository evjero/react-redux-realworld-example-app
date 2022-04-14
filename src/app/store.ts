import {
  AnyAction,
  AsyncThunkAction,
  combineReducers,
  configureStore,
  ThunkAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import commentsReducer from '../features/comments/commentsSlice';
import tagsReducer from '../features/tags/tagsSlice';
import { localStorageMiddleware } from './middleware';
import articleReducer from '../reducers/article';
import articlesReducer from '../reducers/articleList';
import commonReducer from '../reducers/common';
import profileReducer from '../reducers/profile';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

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
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    localStorageMiddleware,
  ],
});

export type AppStore = typeof store;
export type AppDispatch = ThunkDispatch<RootState, void, AnyAction> &
  (<ReturnType>(
    asyncThunk: AsyncThunkAction<ReturnType, unknown, {}>
  ) => ReturnType);
export type RootState = ReturnType<typeof rootReducer>;

export type AsyncThunkOptions<Extra = {}> = {
  dispatch: AppDispatch;
  state: RootState;
} & Extra;
export type AppThunkAction<T = void> = ThunkAction<
  T,
  RootState,
  void,
  AnyAction
>;
export type AppAsyncThunkAction<T = void> =
  | AppThunkAction<T>
  | AsyncThunkAction<T, unknown, AsyncThunkOptions>;

/**
 * @todo Safer type inference with async thunks
 * @see https://github.com/reduxjs/redux-toolkit/issues/1127
 */
export function useAppDispatch<T>(action: AppAsyncThunkAction<T> | AnyAction) {
  return store.dispatch(action as unknown as AnyAction);
}
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
