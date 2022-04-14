import React, { memo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { changeTab, homePageUnloaded } from '../../reducers/articleList';
import Banner from './Banner';
import MainView from './MainView';
import TagsSidebar from '../../features/tags/TagsSidebar';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';

/**
 * Home screen component
 *
 * @example
 * <Home />
 */
function Home(): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    const defaultTab = isAuthenticated ? 'feed' : 'all';
    const fetchArticles = useAppDispatch(changeTab(defaultTab));

    return () => {
      useAppDispatch(homePageUnloaded());
      fetchArticles.abort();
    };
  }, []);

  return (
    <div className="home-page">
      <Banner />

      <div className="container page">
        <div className="row">
          <MainView />

          <div className="col-md-3">
            <TagsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Home);
