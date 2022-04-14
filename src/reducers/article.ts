import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import agent from '../agent';

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

type ArticleSliceState = {
  article?: Record<string, any>;
  inProgress: boolean;
  errors?: any[];
};

const initialState = {
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
      (state: ArticleSliceState, action) => {
        state.article = action.payload.article;
        state.inProgress = false;
      }
    );

    builder.addCase(createArticle.fulfilled, (state: ArticleSliceState) => {
      state.inProgress = false;
    });

    builder.addCase(
      createArticle.rejected,
      (state: ArticleSliceState, action) => {
        state.errors = (action.error as any).errors;
        state.inProgress = false;
      }
    );

    builder.addCase(updateArticle.fulfilled, (state: ArticleSliceState) => {
      state.inProgress = false;
    });

    builder.addCase(
      updateArticle.rejected,
      (state: ArticleSliceState, action) => {
        state.errors = (action.error as any).errors;
        state.inProgress = false;
      }
    );

    builder.addMatcher(
      (action) => action.type.endsWith('/pending'),
      (state: ArticleSliceState) => {
        state.inProgress = true;
      }
    );

    builder.addDefaultCase((state) => {
      state.inProgress = false;
    });
  },
});

export const { articlePageUnloaded } = articleSlice.actions;

export default articleSlice.reducer;
