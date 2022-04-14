import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  Draft,
} from '@reduxjs/toolkit';

import agent, { ApiError, Article, ArticleResponse } from '../agent';

function serializeError(error: any) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
    };
  }

  if (typeof error === 'object' && error !== null) {
    return error;
  }

  return { message: String(error) };
}

export const getArticle = createAsyncThunk(
  'article/getArticle',
  agent.Articles.get
);

export const createArticle = createAsyncThunk(
  'article/createArticle',
  agent.Articles.create,
  { serializeError }
);

export const updateArticle = createAsyncThunk(
  'article/updateArticle',
  agent.Articles.update,
  { serializeError }
);

interface ArticleSliceState extends ApiError {
  article?: Article;
  inProgress: boolean;
}

const initialState: ArticleSliceState = {
  article: undefined,
  inProgress: false,
  errors: undefined,
};

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    articlePageUnloaded: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(
      getArticle.fulfilled,
      (
        state: Draft<ArticleSliceState>,
        action: PayloadAction<ArticleResponse>
      ) => {
        state.article = action.payload.article;
        state.inProgress = false;
      }
    );

    builder.addCase(
      createArticle.fulfilled,
      (state: Draft<ArticleSliceState>) => {
        state.inProgress = false;
      }
    );

    builder.addCase(
      createArticle.rejected,
      (state: Draft<ArticleSliceState>, action) => {
        state.errors = (action.error as any).errors;
        state.inProgress = false;
      }
    );

    builder.addCase(
      updateArticle.fulfilled,
      (state: Draft<ArticleSliceState>) => {
        state.inProgress = false;
      }
    );

    builder.addCase(
      updateArticle.rejected,
      (state: Draft<ArticleSliceState>, action) => {
        state.errors = (action.error as any).errors;
        state.inProgress = false;
      }
    );

    builder.addMatcher(
      (action) => action.type.endsWith('/pending'),
      (state: Draft<ArticleSliceState>) => {
        state.inProgress = true;
      }
    );

    builder.addDefaultCase((state: Draft<ArticleSliceState>) => {
      state.inProgress = false;
    });
  },
});

export const { articlePageUnloaded } = articleSlice.actions;

export default articleSlice.reducer;
