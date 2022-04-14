import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../app/store';

import ListErrors from '../../components/ListErrors';
import { login, register, selectErrors, selectIsLoading } from './authSlice';

/**
 * Auth screen component
 *
 * @example
 * <AuthScreen />
 */
function AuthScreen({
  isRegisterScreen,
}: {
  isRegisterScreen?: boolean;
}): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const errors = useAppSelector(selectErrors);
  const inProgress = useAppSelector(selectIsLoading);
  const navigate = useNavigate();

  const changeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const changeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const authenticateUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    useAppDispatch(
      isRegisterScreen
        ? register({ username, email, password })
        : login({ email, password })
    );
    if (isRegisterScreen) {
      navigate('/login');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">
              {isRegisterScreen ? 'Sign Up' : 'Sign In'}
            </h1>
            <p className="text-xs-center">
              {isRegisterScreen ? (
                <Link to="/login">Have an account?</Link>
              ) : (
                <Link to="/register">Need an account?</Link>
              )}
            </p>

            <ListErrors errors={errors} />

            <form onSubmit={authenticateUser}>
              <fieldset disabled={inProgress}>
                {isRegisterScreen ? (
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Username"
                      autoComplete="username"
                      name="username"
                      value={username}
                      onChange={changeUsername}
                    />
                  </fieldset>
                ) : null}

                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={email}
                    onChange={changeEmail}
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Password"
                    name="password"
                    value={password}
                    onChange={changePassword}
                  />
                </fieldset>

                <button
                  className="btn btn-lg btn-primary pull-xs-right"
                  type="submit"
                >
                  {isRegisterScreen ? 'Sign up' : 'Sign in'}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(AuthScreen);
