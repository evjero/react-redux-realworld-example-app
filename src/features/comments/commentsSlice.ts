import {
  AnyAction,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dictionary,
  EntityId,
  PayloadAction,
} from '@reduxjs/toolkit';

import agent, { ApiError, Meta } from '../../agent';
import {
  isApiError,
  loadingReducer,
  Status,
  StatusType,
} from '../../common/utils';
import { selectIsAuthenticated, selectUser } from '../auth/authSlice';
import type { Comment } from '../../agent';
import { StoreState } from '../../app/store';

export interface CommentsState extends ApiError {
  status: StatusType;
  ids: EntityId[];
  entities: Dictionary<Comment>;
}

const commentAdapter = createEntityAdapter({
  sortComparer: (a: Comment, b: Comment) =>
    b.createdAt.localeCompare(a.createdAt),
});

type CreateCommentRequest = {
  articleSlug: string;
  comment: Partial<Comment>;
};

/**
 * Send a create request
 *
 * @param {object} argument
 * @param {string} argument.articleSlug
 * @param {object} argument.comment
 * @param {string} argument.comment.body
 */
export const createComment = createAsyncThunk(
  'comments/createComment',
  async (
    { articleSlug, comment: newComment }: CreateCommentRequest,
    thunkApi
  ) => {
    try {
      const { comment } = await agent.Comments.create(articleSlug, newComment);

      return comment;
    } catch (error: any) {
      if (isApiError(error)) {
        return thunkApi.rejectWithValue(error);
      }

      throw error;
    }
  },
  {
    condition: (_, { getState }) =>
      //@ts-ignore
      selectIsAuthenticated(getState()) && !selectIsLoading(getState()),
    //@ts-ignore
    getPendingMeta: (_, { getState }) => ({ author: selectUser(getState()) }),
  }
);

/**
 * Send a get all request
 *
 * @param {string} articleSlug
 */
export const getCommentsForArticle = createAsyncThunk(
  'comments/getCommentsForArticle',
  async (articleSlug: string) => {
    const { comments } = await agent.Comments.forArticle(articleSlug);

    return comments;
  },
  {
    //@ts-ignore
    condition: (_, { getState }) => !selectIsLoading(getState()),
  }
);

type RemoveCommentRequest = {
  articleSlug: string;
  commentId: number;
};

/**
 * Send a remove request
 */
export const removeComment = createAsyncThunk(
  'comments/removeComment',
  async ({ articleSlug, commentId }: RemoveCommentRequest) => {
    await agent.Comments.delete(articleSlug, commentId);
  },
  {
    condition: ({ commentId }, { getState }) =>
      //@ts-ignore
      selectIsAuthenticated(getState()) &&
      //@ts-ignore
      selectCommentsSlice(getState()).ids.includes(commentId) &&
      //@ts-ignore
      !selectIsLoading(getState()),
  }
);

const initialState: CommentsState = commentAdapter.getInitialState({
  status: Status.IDLE,
});

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(
      createComment.pending,
      (state: CommentsState, action: PayloadAction<void, string, any>) => {
        state.status = Status.LOADING;

        if (action.meta.arg.comment.body) {
          commentAdapter.addOne(state, {
            ...action.meta.arg.comment,
            author: action.meta.author,
            id: action.meta.requestId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    );

    builder.addCase(
      createComment.fulfilled,
      (
        state: CommentsState,
        action: PayloadAction<Partial<Comment>, string, Meta>
      ) => {
        state.status = Status.SUCCESS;
        commentAdapter.updateOne(state, {
          id: action.meta.requestId,
          changes: action.payload,
        });
        delete state.errors;
      }
    );

    builder.addCase(
      createComment.rejected,
      (state: CommentsState, action: PayloadAction<any, string, Meta>) => {
        state.status = Status.FAILURE;
        state.errors = action.payload.errors;
        commentAdapter.removeOne(state, action.meta.requestId);
      }
    );

    builder.addCase(
      getCommentsForArticle.fulfilled,
      (state: CommentsState, action: PayloadAction<Comment[]>) => {
        state.status = Status.SUCCESS;
        commentAdapter.setAll(state, action.payload);
      }
    );

    builder.addCase(
      removeComment.fulfilled,
      (
        state: CommentsState,
        action: PayloadAction<void, string, Meta<RemoveCommentRequest>>
      ) => {
        state.status = Status.SUCCESS;
        commentAdapter.removeOne(state, action.meta.arg.commentId);
      }
    );

    builder.addMatcher(
      (action: AnyAction) => /comments\/.*\/pending/.test(action.type),
      loadingReducer
    );
  },
});

/**
 * Get comments state
 *
 * @param {object} state
 * @returns {CommentsState}
 */
const selectCommentsSlice = (state: StoreState) => state.comments;

const commentSelectors = commentAdapter.getSelectors(selectCommentsSlice);

/**
 * Get all comments
 *
 * @param {object} state
 * @returns {import('../../agent').Comment[]}
 */
export const selectAllComments = commentSelectors.selectAll;

/**
 * Get one comment
 * @returns {import('@reduxjs/toolkit').Selector<object, import('../../agent').Comment>}
 */
const selectCommentById = (commentId: number) => (state: StoreState) =>
  commentSelectors.selectById(state, commentId);

/**
 * Get is the comment's author
 * @returns {import('@reduxjs/toolkit').Selector<object, boolean>}
 */
export const selectIsAuthor = (commentId: number) =>
  createSelector(
    selectCommentById(commentId),
    selectUser,
    (comment, currentUser) => currentUser?.username === comment?.author.username
  );

/**
 * Get is loading
 *
 * @param {object} state
 * @returns {boolean}
 */
export const selectIsLoading = (state: StoreState) =>
  selectCommentsSlice(state).status === Status.LOADING;

/**
 * Get is errors
 *
 * @param {object} state
 * @returns {Record<string, string[]>}
 */
export const selectErrors = (state: StoreState) =>
  selectCommentsSlice(state).errors;

export default commentsSlice.reducer;
