import React, { memo, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ArticleList from './ArticleList';
import {
  getArticlesByAuthor,
  getFavoriteArticles,
} from '../reducers/articleList';
import {
  follow,
  unfollow,
  getProfile,
  profilePageUnloaded,
} from '../reducers/profile';
import { selectUser } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../app/store';
import type { Profile } from '../agent';

/**
 * Go to profile settings
 *
 * @example
 * <EditProfileSettings />
 */
function EditProfileSettings(): JSX.Element {
  return (
    <Link
      to="/settings"
      className="btn btn-sm btn-outline-secondary action-btn"
    >
      <i className="ion-gear-a" /> Edit Profile Settings
    </Link>
  );
}

type FollowRequest = {
  username?: string;
  following?: boolean;
};
/**
 * Follow or unfollow an user
 *
 * @example
 * <FollowUserButton username="warren_boyd" following />
 */
function FollowUserButton({ username, following }: FollowRequest) {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  let classes = 'btn btn-sm action-btn';
  let textMessage;

  if (following) {
    classes += ' btn-secondary';
    textMessage = `Unfollow ${username}`;
  } else {
    classes += ' btn-outline-secondary';
    textMessage = `Follow ${username}`;
  }

  const handleClick = (): void => {
    if (!currentUser) {
      //eslint-disable-next-line
      //@ts-ignore
      navigate.push(`/register?redirectTo=${location.pathname}`);
      return;
    }
    if (username) {
      if (following) {
        useAppDispatch(unfollow(username));
      } else {
        useAppDispatch(follow(username));
      }
    }
  };

  return (
    <button className={classes} onClick={handleClick}>
      <i className="ion-plus-round" />
      &nbsp;
      {textMessage}
    </button>
  );
}

/**
 * Show the profile of an user
 *
 * @example
 * <UserInfo profile={{
 *      username: 'warren_boyd',
 *      email: 'warren.boyd@mailinator.com',
 *      image: 'https://static.productionready.io/images/smiley-cyrus.jpg',
 *      bio: null,
 *      following: false,
 *    }}
 * />
 */
function UserInfo({ profile }: { profile: Partial<Profile> }) {
  const currentUser = useAppSelector(selectUser);
  const isCurrentUser = profile.username === currentUser?.username;

  return (
    <div className="user-info">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <img
              src={
                profile.image ||
                'https://static.productionready.io/images/smiley-cyrus.jpg'
              }
              className="user-img"
              alt={profile.username}
            />
            <h4>{profile.username}</h4>
            <p>{profile.bio}</p>

            {isCurrentUser ? (
              <EditProfileSettings />
            ) : (
              <FollowUserButton
                username={profile.username}
                following={profile.following}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type ProfileTabsProps = {
  username?: string;
  isFavorites?: boolean;
};
/**
 * Profile's navigation
 *
 * @example
 * <ProfileTabs username="warren_boyd" isFavorites />
 */
function ProfileTabs({ username, isFavorites }: ProfileTabsProps) {
  return (
    <div className="articles-toggle">
      <ul className="nav nav-pills outline-active">
        <li className="nav-item">
          <Link
            className={isFavorites ? 'nav-link' : 'nav-link active'}
            to={`/@${username}`}
          >
            My Articles
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className={isFavorites ? 'nav-link active' : 'nav-link'}
            to={`/@${username}/favorites`}
          >
            Favorited Articles
          </Link>
        </li>
      </ul>
    </div>
  );
}

type ProfileProps = { isFavoritePage?: boolean };
/**
 * Profile screen component
 
* @example
 * <Profile />
 */
function Profile({ isFavoritePage }: ProfileProps): JSX.Element {
  const { status, ...profile } = useAppSelector((state) => state.profile);
  const { username } = useParams();

  useEffect(() => {
    const fetchProfile = useAppDispatch(getProfile(username!));
    const fetchArticles = useAppDispatch(
      isFavoritePage
        ? getFavoriteArticles({ username })
        : getArticlesByAuthor({ author: username! })
    );

    return () => {
      fetchProfile.abort();
      fetchArticles.abort();
    };
  }, [username, isFavoritePage]);

  useEffect(() => {
    return () => {
      useAppDispatch(profilePageUnloaded());
    };
  }, []);

  if (!profile) {
    return <></>;
  }

  return (
    <div className="profile-page">
      <UserInfo profile={profile} />

      <div className="container page">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <ProfileTabs
              username={profile.username}
              isFavorites={isFavoritePage}
            />

            <ArticleList />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Profile);
