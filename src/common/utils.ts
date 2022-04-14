import { Draft, PayloadAction } from '@reduxjs/toolkit';
import { ApiError } from '../agent';
import { AuthState } from '../features/auth/authSlice';

/**
 * States of the slice
 */
export const Status = {
  /** The initial state */
  IDLE: 'idle',
  /** The loading state */
  LOADING: 'loading',
  /** The success state */
  SUCCESS: 'success',
  /** The error state */
  FAILURE: 'failure',
};
export type StatusType = typeof Status[keyof typeof Status];

/**
 * Check if error is an ApiError
 *
 * @param {object} error
 * @returns {boolean} error is ApiError
 */
export function isApiError(error: any): boolean {
  return typeof error === 'object' && error !== null && 'errors' in error;
}

/**
 * Set state as loading
 */
export function loadingReducer(state: Draft<AuthState>): void {
  state.status = Status.LOADING;
}
