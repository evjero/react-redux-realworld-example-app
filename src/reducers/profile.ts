import {
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';

import agent, { Profile, ProfileResponse } from '../agent';
import { Status, StatusType } from '../common/utils';

export const getProfile = createAsyncThunk(
  'profile/getProfile',
  agent.Profile.get
);

export const follow = createAsyncThunk('profile/follow', agent.Profile.follow);

export const unfollow = createAsyncThunk(
  'profile/unfollow',
  agent.Profile.unfollow
);

type ProfileState = {
  status: StatusType;
} & Partial<Profile>;

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    status: Status.IDLE,
  },
  reducers: {
    profilePageUnloaded: (state: Draft<ProfileState>) => {
      delete state.username;
      delete state.bio;
      delete state.following;
      delete state.image;
      return {
        status: Status.IDLE,
      };
    },
  },
  extraReducers: (builder) => {
    const successCaseReducer = (
      state: ProfileState,
      action: PayloadAction<ProfileResponse>
    ) => ({
      status: Status.SUCCESS,
      ...action.payload.profile,
    });

    builder.addCase(getProfile.fulfilled, successCaseReducer);
    builder.addCase(follow.fulfilled, successCaseReducer);
    builder.addCase(unfollow.fulfilled, successCaseReducer);
  },
});

export const { profilePageUnloaded } = profileSlice.actions;

export default profileSlice.reducer;
