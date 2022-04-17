import {
  AsyncThunkOptions,
  createAsyncThunk,
  createSelector,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';

import agent, { User, UpdateUserRequest, ApiError } from '../../agent';
import {
  isApiError,
  loadingReducer,
  Status,
  StatusType,
} from '../../common/utils';
import type { RootState } from '../../app/store';

export interface AuthState extends ApiError {
  status: StatusType;
  token?: string;
  user?: User;
}

type RegistrationRequest = {
  password: string;
} & Pick<User, 'email' | 'username'>;

type LoginRequest = {
  password: string;
} & Pick<User, 'email'>;

/**
 * Send a register request
 */
export const register = createAsyncThunk<
  User,
  RegistrationRequest,
  { state: RootState }
>(
  'auth/register',
  async ({ username, email, password }: RegistrationRequest, thunkApi) => {
    try {
      const { user } = await agent.Auth.register(username, email, password);
      return user;
    } catch (error) {
      if (isApiError(error)) {
        return thunkApi.rejectWithValue(error);
      }

      throw error;
    }
  },
  {
    condition: (_, thunkApi) => !selectIsLoading(thunkApi.getState()),
  }
);
/**
 * Send a login request
 */
export const login = createAsyncThunk<User, LoginRequest, { state: RootState }>(
  'auth/login',
  async ({ email, password }: LoginRequest, thunkApi) => {
    try {
      const { user } = await agent.Auth.login(email, password);

      return user;
    } catch (error: any) {
      if (isApiError(error)) {
        return thunkApi.rejectWithValue(error);
      }

      throw error;
    }
  },
  {
    condition: (_, thunkApi) => !selectIsLoading(thunkApi.getState()),
  }
);

/**
 * Send a get current user request
 */
export const getUser = createAsyncThunk<User, void, { state: RootState }>(
  'auth/getUser',
  async () => {
    const { user } = await agent.Auth.current();

    return user;
  },
  {
    condition: (_, thunkApi) =>
      Boolean(selectAuthSlice(thunkApi.getState()).token),
  }
);

/**
 * Send a update user request
 */
export const updateUser = createAsyncThunk<
  User,
  UpdateUserRequest,
  { state: RootState }
>(
  'auth/updateUser',
  async (
    { email, username, bio, image, password }: UpdateUserRequest,
    thunkApi
  ) => {
    try {
      const { user } = await agent.Auth.save({
        email,
        username,
        bio,
        image,
        password,
      });

      return user;
    } catch (error) {
      if (isApiError(error)) {
        return thunkApi.rejectWithValue(error);
      }

      throw error;
    }
  },
  {
    condition: (_, thunkApi) =>
      selectIsAuthenticated(thunkApi.getState()) &&
      !selectIsLoading(thunkApi.getState()),
  }
);

const initialState: AuthState = {
  status: Status.IDLE,
};

function successReducer(
  state: Draft<AuthState>,
  action: PayloadAction<User>
): void {
  state.status = Status.SUCCESS;
  state.token = action.payload.token;
  state.user = action.payload;
  delete state.errors;
}

export function failureReducer(
  state: Draft<AuthState>,
  action: PayloadAction<any> //ApiError
): void {
  state.status = Status.FAILURE;
  state.errors = action.payload.errors;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Log out the user
     */
    logout: () => initialState,
    /**
     * Update token
     */
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.fulfilled, successReducer)
      .addCase(register.fulfilled, successReducer)
      .addCase(getUser.fulfilled, successReducer)
      .addCase(updateUser.fulfilled, successReducer);

    builder
      .addCase(login.rejected, failureReducer)
      .addCase(register.rejected, failureReducer)
      .addCase(updateUser.rejected, failureReducer);

    builder.addMatcher(
      (action) => /auth\/.*\/pending/.test(action.type),
      loadingReducer
    );
  },
});

export const { setToken, logout } = authSlice.actions;

/**
 * Get auth slice
 */
const selectAuthSlice = (state: RootState): AuthState => state.auth;

/**
 * Get current user
 */
export const selectUser = (state: RootState) => selectAuthSlice(state).user;

/**
 * Get errors
 */
export const selectErrors = (state: RootState): AuthState['errors'] =>
  selectAuthSlice(state).errors;

/**
 * Get is loading
 *
 * @param {object} state
 * @returns {boolean} There are pending effects
 */
export const selectIsLoading = (state: RootState) =>
  selectAuthSlice(state).status === Status.LOADING;

/**
 * Get is authenticated
 *
 * @param {object} state
 * @returns {boolean}
 */
export const selectIsAuthenticated = createSelector(
  (state: RootState) => selectAuthSlice(state).token,
  selectUser,
  (token, user) => Boolean(token && user)
);

export default authSlice.reducer;
