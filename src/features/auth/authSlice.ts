import {
  createAsyncThunk,
  createSelector,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';

import agent, { User, UpdateUserRequest, ApiError } from '../../agent';
import { StoreState } from '../../app/store';
import {
  failureReducer,
  isApiError,
  loadingReducer,
  Status,
} from '../../common/utils';

export type AuthState = {
  status: Status;
  token?: string;
  user?: User;
  errors?: Record<string, string[]>;
};

type RegistrationRequest = {
  password: string;
} & Pick<User, 'email' | 'username'>;

type LoginRequest = {
  password: string;
} & Pick<User, 'email'>;

/**
 * Send a register request
 */
export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }: RegistrationRequest, thunkApi) => {
    try {
      const {
        user: { token, ...user },
      } = await agent.Auth.register(username, email, password);

      return { token, user };
    } catch (error) {
      if (isApiError(error)) {
        return thunkApi.rejectWithValue(error);
      }

      throw error;
    }
  },
  {
    //@ts-ignore
    condition: (_, { getState }) => !selectIsLoading(getState()),
  }
);
/**
 * Send a login request
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginRequest, thunkApi) => {
    try {
      const {
        user: { token, ...user },
      } = await agent.Auth.login(email, password);

      return { token, user };
    } catch (error) {
      if (isApiError(error)) {
        return thunkApi.rejectWithValue(error);
      }

      throw error;
    }
  },
  {
    //@ts-ignore
    condition: (_, { getState }) => !selectIsLoading(getState()),
  }
);

/**
 * Send a get current user request
 */
export const getUser = createAsyncThunk(
  'auth/getUser',
  async () => {
    const {
      user: { token, ...user },
    } = await agent.Auth.current();

    return { token, user };
  },
  {
    //@ts-ignore
    condition: (_, { getState }) => Boolean(selectAuthSlice(getState()).token),
  }
);

/**
 * Send a update user request
 */
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (
    { email, username, bio, image, password }: UpdateUserRequest,
    thunkApi
  ) => {
    try {
      const {
        user: { token, ...user },
      } = await agent.Auth.save({ email, username, bio, image, password });

      return { token, user };
    } catch (error) {
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
  }
);

/**
 * @type {AuthState}
 */
const initialState = {
  status: Status.IDLE,
};

/**
 * @param {import('@reduxjs/toolkit').Draft<AuthState>} state
 * @param {import('@reduxjs/toolkit').PayloadAction<{token: string, user: User}>} action
 */
function successReducer(state: Draft<AuthState>, action: PayloadAction<any>) {
  state.status = Status.SUCCESS;
  state.token = action.payload.token;
  state.user = action.payload.user;
  delete state.errors;
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
    setToken(state: Draft<AuthState>, action: PayloadAction<string>) {
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
const selectAuthSlice = (state: StoreState): AuthState => state.auth;

/**
 * Get current user
 */
export const selectUser = (state: StoreState) => selectAuthSlice(state).user;

/**
 * Get errors
 */
export const selectErrors = (state: StoreState): AuthState['errors'] =>
  selectAuthSlice(state).errors;

/**
 * Get is loading
 *
 * @param {object} state
 * @returns {boolean} There are pending effects
 */
export const selectIsLoading = (state: StoreState) =>
  selectAuthSlice(state).status === Status.LOADING;

/**
 * Get is authenticated
 *
 * @param {object} state
 * @returns {boolean}
 */
export const selectIsAuthenticated = createSelector(
  (state: StoreState) => selectAuthSlice(state).token,
  selectUser,
  (token, user) => Boolean(token && user)
);

export default authSlice.reducer;
