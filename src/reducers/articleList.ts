import {
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';
import { ThunkActionDispatch } from 'redux-thunk';

import agent, {
  Article,
  ArticleResponse,
  ArticlesResponse,
  Meta,
  QueryParams,
} from '../agent';
import { AppStore } from '../app/store';
import { profilePageUnloaded } from './profile';

export const changeTab = (tab: any) => (dispatch: ThunkActionDispatch<any>) => {
  dispatch(articleListSlice.actions.changeTab(tab));
  return dispatch(getAllArticles());
};

type ArticlesByAuthorRequest = {
  author: string;
  page: number;
};

export const getArticlesByAuthor = createAsyncThunk(
  'articleList/getArticlesByAuthor',
  ({ author, page }: ArticlesByAuthorRequest) =>
    agent.Articles.byAuthor(author, page)
);

export const getAllArticles = createAsyncThunk(
  'articleList/getAll',
  ({ page, author, tag, favorited }: QueryParams = {}, thunkApi: any) =>
    thunkApi.getState().articleList.tab === 'feed'
      ? agent.Articles.feed(page ?? 0)
      : agent.Articles.all({
          page: page ?? thunkApi.getState().articleList.currentPage,
          author: author ?? thunkApi.getState().articleList.author,
          tag: tag ?? thunkApi.getState().articleList.tag,
          favorited: favorited ?? thunkApi.getState().articleList.favorited,
          limit: thunkApi.getState().articleList.articlesPerPage ?? 10,
        })
);

export const getArticlesByTag = createAsyncThunk(
  'articleList/getArticlesByTag',
  ({ tag, page }: QueryParams = {}) =>
    agent.Articles.byTag(tag ?? '', page ?? 0)
);

export const getFavoriteArticles = createAsyncThunk(
  'articleList/getFavoriteArticles',
  ({ username, page }: Partial<{ username: string; page: number }> = {}) =>
    agent.Articles.favoritedBy(username ?? '', page ?? 0)
);

export const favoriteArticle = createAsyncThunk(
  'articleList/favoriteArticle',
  agent.Articles.favorite
);

export const unfavoriteArticle = createAsyncThunk(
  'articleList/unfavoriteArticle',
  agent.Articles.unfavorite
);

type ArticleListState = {
  articles: Article[];
  articlesCount: number;
  currentPage: number;
  articlesPerPage: number;
  tab?: unknown;
  tag?: string;
  author?: string;
  favorited?: unknown;
};

const initialState: ArticleListState = {
  articles: [],
  articlesCount: 0,
  currentPage: 0,
  articlesPerPage: 10,
  tab: undefined,
  tag: undefined,
  author: undefined,
  favorited: undefined,
};

const articleListSlice = createSlice({
  name: 'articleList',
  initialState,
  reducers: {
    homePageUnloaded: () => initialState,
    changeTab: (state, action) => {
      state.tab = action.payload;
      delete state.tag;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      favoriteArticle.fulfilled,
      (
        state: Draft<ArticleListState>,
        action: PayloadAction<ArticleResponse>
      ) => {
        state.articles = state.articles.map((article) =>
          article.slug === action.payload.article.slug
            ? {
                ...article,
                favorited: action.payload.article.favorited,
                favoritesCount: action.payload.article.favoritesCount,
              }
            : article
        );
      }
    );

    builder.addCase(
      unfavoriteArticle.fulfilled,
      (
        state: Draft<ArticleListState>,
        action: PayloadAction<ArticleResponse>
      ) => {
        state.articles = state.articles.map((article) =>
          article.slug === action.payload.article.slug
            ? {
                ...article,
                favorited: action.payload.article.favorited,
                favoritesCount: action.payload.article.favoritesCount,
              }
            : article
        );
      }
    );

    builder.addCase(
      getAllArticles.fulfilled,
      (
        state: Draft<ArticleListState>,
        action: PayloadAction<
          ArticlesResponse,
          string,
          Meta<QueryParams | undefined>
        >
      ) => {
        state.articles = action.payload.articles;
        state.articlesCount = action.payload.articlesCount;
        state.currentPage = action.meta.arg?.page ?? 0;
      }
    );

    builder.addCase(
      getArticlesByTag.fulfilled,
      (
        _,
        action: PayloadAction<
          ArticlesResponse,
          string,
          Meta<QueryParams | undefined>
        >
      ) => ({
        articles: action.payload.articles,
        articlesCount: action.payload.articlesCount,
        currentPage: action.meta.arg?.page ?? 0,
        tag: action.meta.arg?.tag,
        articlesPerPage: 10,
      })
    );

    builder.addCase(
      getArticlesByAuthor.fulfilled,
      (
        _,
        action: PayloadAction<
          ArticlesResponse,
          string,
          Meta<QueryParams | undefined>
        >
      ) => ({
        articles: action.payload.articles,
        articlesCount: action.payload.articlesCount,
        currentPage: action.meta.arg?.page ?? 0,
        author: action.meta.arg?.author,
        articlesPerPage: 5,
      })
    );

    builder.addCase(
      getFavoriteArticles.fulfilled,
      (
        _,
        action: PayloadAction<
          ArticlesResponse,
          string,
          Meta<QueryParams | undefined>
        >
      ) => ({
        articles: action.payload.articles,
        articlesCount: action.payload.articlesCount,
        currentPage: action.meta.arg?.page ?? 0,
        favorited: action.meta.arg?.username,
        articlesPerPage: 5,
      })
    );

    builder.addMatcher(
      (action) => [profilePageUnloaded.type].includes(action.type),
      () => initialState
    );
  },
});

export const { homePageUnloaded } = articleListSlice.actions;

export default articleListSlice.reducer;
