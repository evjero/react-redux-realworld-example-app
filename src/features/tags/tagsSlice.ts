import {
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';

import agent from '../../agent';
import { StoreState } from '../../app/store';
import { Status, StatusType } from '../../common/utils';

export type TagsState = {
  status: StatusType;
  tags: string[];
};

/**
 * Fetch all tags
 */
export const getAllTags = createAsyncThunk('tags/getAllTags', async () => {
  const { tags } = await agent.Tags.getAll();

  return tags;
});

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
      .addCase(getAllTags.pending, (state: Draft<TagsState>) => {
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
const selectTagsState = (state: StoreState) => state.tags;

/**
 * Get tags from state
 *
 * @param {object} state
 * @returns {string[]}
 */
export const selectTags = (state: StoreState) => selectTagsState(state).tags;

/**
 * Is loading
 *
 * @param {object} state
 * @returns {boolean}
 */
export const selectIsLoading = (state: StoreState) =>
  selectTagsState(state).status === Status.LOADING;

export default tagsSlice.reducer;
