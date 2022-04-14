import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import agent, { ArticleResponse } from '../agent';
import { articlePageUnloaded, createArticle, updateArticle } from './article';
import { profilePageUnloaded } from './profile';
import { homePageUnloaded } from './articleList';
import {
  getUser,
  login,
  logout,
  register,
  setToken,
  updateUser,
} from '../features/auth/authSlice';
import { ThunkActionDispatch } from 'redux-thunk';
import type { AsyncThunkOptions, RootState } from '../app/store';

export const deleteArticle = createAsyncThunk<void, string, AsyncThunkOptions>(
  'common/deleteArticle',
  agent.Articles.del
);

export const appLoad =
  (token: string) => (dispatch: ThunkActionDispatch<any>) => {
    dispatch(commonSlice.actions.loadApp());

    if (token) {
      agent.setToken(token);
      dispatch(setToken(token));
      return dispatch(getUser());
    }
  };

type CommonState = {
  appName: string;
  appLoaded: boolean;
  viewChangeCounter: number;
  redirectTo?: string;
};

const initialState: CommonState = {
  appName: 'Conduit',
  appLoaded: false,
  viewChangeCounter: 0,
  redirectTo: undefined,
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    loadApp(state) {
      state.appLoaded = true;
    },
    clearRedirect(state) {
      delete state.redirectTo;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteArticle.fulfilled, (state) => {
        state.redirectTo = '/';
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.redirectTo = '/';
      })
      .addCase(login.fulfilled, (state) => {
        state.redirectTo = '/';
      })
      .addCase(register.fulfilled, (state) => {
        state.redirectTo = '/';
      })
      .addCase(logout, (state) => {
        state.redirectTo = '/';
      })
      .addCase(
        createArticle.fulfilled,
        (state, action: PayloadAction<ArticleResponse>) => {
          state.redirectTo = `/article/${action.payload.article.slug}`;
        }
      )
      .addCase(
        updateArticle.fulfilled,
        (state, action: PayloadAction<ArticleResponse>) => {
          state.redirectTo = `/article/${action.payload.article.slug}`;
        }
      )
      .addMatcher(
        (action) =>
          [
            articlePageUnloaded.type,
            homePageUnloaded.type,
            profilePageUnloaded.type,
          ].includes(action.type),
        (state) => {
          state.viewChangeCounter++;
        }
      );
  },
});

export const { clearRedirect } = commonSlice.actions;

export default commonSlice.reducer;
