import React, { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { AnyAction } from 'redux';
import { UpdateUserRequest, User } from '../../agent';
import { useAppDispatch, useAppSelector } from '../../app/store';

import ListErrors from '../../components/ListErrors';
import {
  logout,
  selectErrors,
  selectIsAuthenticated,
  selectIsLoading,
  selectUser,
  updateUser,
} from './authSlice';
type SettingsFormProps = {
  currentUser: User;
  onSaveSettings: (user: UpdateUserRequest) => AnyAction;
};
/**
 * Settings form component
 *
 * @example
 * <SettingsForm
 *    currentUser={{
 *      username: 'warren_boyd',
 *      email: 'warren.boyd@mailinator.com',
 *      image: 'https://static.productionready.io/images/smiley-cyrus.jpg',
 *      bio: null,
 *    }}
 *    onSaveSettings={user => useAppDispatch(updateUser(user))}
 * />
 */
function SettingsForm({
  currentUser,
  onSaveSettings,
}: SettingsFormProps): JSX.Element {
  const [image, setImage] = useState(
    currentUser?.image ??
      'https://static.productionready.io/images/smiley-cyrus.jpg'
  );
  const [username, setUsername] = useState(currentUser?.username ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [password, setPassword] = useState('');
  const isLoading = useAppSelector(selectIsLoading);

  const changeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImage(event.target.value);
  };

  const changeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const changeBio = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(event.target.value);
  };

  const changeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const saveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user: UpdateUserRequest = {
      image,
      username,
      bio,
      email,
      password: password ?? undefined,
    };

    onSaveSettings(user);
  };

  return (
    <form onSubmit={saveSettings}>
      <fieldset disabled={isLoading}>
        <fieldset className="form-group">
          <input
            className="form-control"
            type="text"
            placeholder="URL of profile picture"
            name="image"
            value={image}
            onChange={changeImage}
          />
        </fieldset>

        <fieldset className="form-group">
          <input
            className="form-control form-control-lg"
            type="text"
            placeholder="Username"
            name="username"
            value={username}
            onChange={changeUsername}
          />
        </fieldset>

        <fieldset className="form-group">
          <textarea
            className="form-control form-control-lg"
            rows={8}
            placeholder="Short bio about you"
            name="bio"
            value={bio}
            onChange={changeBio}
          />
        </fieldset>

        <fieldset className="form-group">
          <input
            className="form-control form-control-lg"
            autoComplete="current-email"
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={changeEmail}
          />
        </fieldset>

        <fieldset className="form-group">
          <input
            className="form-control form-control-lg"
            type="password"
            autoComplete="current-password"
            placeholder="New Password"
            name="password"
            value={password}
            onChange={changePassword}
          />
        </fieldset>

        <button className="btn btn-lg btn-primary pull-xs-right" type="submit">
          Update Settings
        </button>
      </fieldset>
    </form>
  );
}

/**
 * Settings screen component
 *
 * @example
 * <SettingsScreen />
 */
function SettingsScreen() {
  const dispatch = useDispatch();
  const currentUser = useAppSelector(selectUser);
  const errors = useAppSelector(selectErrors);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const saveSettings = (user: UpdateUserRequest) => {
    return useAppDispatch(updateUser(user));
  };

  const logoutUser = () => {
    useAppDispatch(logout());
  };

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>

            <ListErrors errors={errors} />

            {currentUser && (
              <SettingsForm
                currentUser={currentUser}
                onSaveSettings={saveSettings}
              />
            )}

            <hr />

            <button className="btn btn-outline-danger" onClick={logoutUser}>
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SettingsScreen);
