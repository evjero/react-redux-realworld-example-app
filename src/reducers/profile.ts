import {
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';

import agent, { Profile, ProfileResponse } from '../agent';
import { Status, StatusType } from '../common/utils';
import type { AsyncThunkOptions, RootState } from '../app/store';

export const getProfile = createAsyncThunk<
  ProfileResponse,
  string,
  AsyncThunkOptions
>('profile/getProfile', agent.Profile.get);

export const follow = createAsyncThunk<
  ProfileResponse,
  string,
  AsyncThunkOptions
>('profile/follow', agent.Profile.follow);

export const unfollow = createAsyncThunk<
  ProfileResponse,
  string,
  AsyncThunkOptions
>('profile/unfollow', agent.Profile.unfollow);

type ProfileState = {
  status: StatusType;
} & Partial<Profile>;

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    status: Status.IDLE,
  } as ProfileState,
  reducers: {
    profilePageUnloaded: (state) => {
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
      _: ProfileState,
      action: PayloadAction<ProfileResponse>
    ) => ({
      status: Status.SUCCESS,
      ...action.payload.profile,
    });

    builder
      .addCase(getProfile.fulfilled, successCaseReducer)
      .addCase(follow.fulfilled, successCaseReducer)
      .addCase(unfollow.fulfilled, successCaseReducer);
  },
});

export const { profilePageUnloaded } = profileSlice.actions;

export default profileSlice.reducer;
