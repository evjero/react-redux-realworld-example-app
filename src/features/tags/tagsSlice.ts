import {
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';

import agent from '../../agent';
import { Status, StatusType } from '../../common/utils';
import type { AsyncThunkOptions, RootState } from '../../app/store';

export type TagsState = {
  status: StatusType;
  tags: string[];
};

/**
 * Fetch all tags
 */
export const getAllTags = createAsyncThunk<string[], void, AsyncThunkOptions>(
  'tags/getAllTags',
  async () => {
    const { tags } = await agent.Tags.getAll();

    return tags;
  }
);

/**
 * Tags state
 */
const initialState: TagsState = {
  status: Status.IDLE,
  tags: [],
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getAllTags.pending, (state) => {
        state.status = Status.LOADING;
      })
      .addCase(getAllTags.fulfilled, (_, action: PayloadAction<string[]>) => ({
        status: Status.SUCCESS,
        tags: action.payload,
      }));
  },
});

/**
 * Get tags slice
 *
 * @param {object} state
 * @returns {TagsState}
 */
const selectTagsState = (state: RootState) => state.tags;

/**
 * Get tags from state
 *
 * @param {object} state
 * @returns {string[]}
 */
export const selectTags = (state: RootState) => selectTagsState(state).tags;

/**
 * Is loading
 *
 * @param {object} state
 * @returns {boolean}
 */
export const selectIsLoading = (state: RootState) =>
  selectTagsState(state).status === Status.LOADING;

export default tagsSlice.reducer;
