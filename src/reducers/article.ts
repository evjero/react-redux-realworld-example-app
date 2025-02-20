import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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

export const getArticle = createAsyncThunk<ArticleResponse, string>(
  'article/getArticle',
  agent.Articles.get
);

export const createArticle = createAsyncThunk<
  ArticleResponse,
  Partial<Article>
>('article/createArticle', agent.Articles.create, { serializeError });

export const updateArticle = createAsyncThunk<
  ArticleResponse,
  Partial<Article>
>('article/updateArticle', agent.Articles.update, { serializeError });

interface ArticleState extends ApiError {
  article?: Article;
  inProgress: boolean;
}

const initialState: ArticleState = {
  article: undefined,
  inProgress: false,
  errors: undefined,
};

const articleSlice = createSlice({
  name: 'article',
  initialState: initialState as ArticleState,
  reducers: {
    articlePageUnloaded: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getArticle.fulfilled,
        (state, action: PayloadAction<ArticleResponse>) => {
          state.article = action.payload.article;
          state.inProgress = false;
        }
      )
      .addCase(createArticle.fulfilled, (state) => {
        state.inProgress = false;
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.errors = (action.error as any).errors;
        state.inProgress = false;
      })
      .addCase(updateArticle.fulfilled, (state) => {
        state.inProgress = false;
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.errors = (action.error as any).errors;
        state.inProgress = false;
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.inProgress = true;
        }
      )
      .addDefaultCase((state) => {
        state.inProgress = false;
      });
  },
});

export const { articlePageUnloaded } = articleSlice.actions;

export default articleSlice.reducer;
