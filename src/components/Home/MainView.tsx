import React, { memo } from 'react';

import ArticleList from '../ArticleList';
import { changeTab } from '../../reducers/articleList';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../app/store';

/**
 * Your feed tab
 *
 * @example
 * <YourFeedTab />
 */
function YourFeedTab(): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentTab = useAppSelector((state) => state.articleList.tab);
  const isActiveTab = currentTab === 'feed';

  if (!isAuthenticated) {
    return <></>;
  }

  const dispatchChangeTab = () => {
    useAppDispatch(changeTab('feed'));
  };

  return (
    <li className="nav-item">
      <button
        type="button"
        className={isActiveTab ? 'nav-link active' : 'nav-link'}
        onClick={dispatchChangeTab}
      >
        Your Feed
      </button>
    </li>
  );
}

/**
 * Global feed tab
 *
 * @example
 * <GlobalFeedTab />
 */
function GlobalFeedTab(): JSX.Element {
  const currentTab = useAppSelector((state) => state.articleList.tab);
  const isActiveTab = currentTab === 'all';

  /**
   * Change to all tab
   * @type{React.MouseEventHandler}
   */
  const dispatchChangeTab = () => {
    useAppDispatch(changeTab('all'));
  };

  return (
    <li className="nav-item">
      <button
        type="button"
        className={isActiveTab ? 'nav-link active' : 'nav-link'}
        onClick={dispatchChangeTab}
      >
        Global Feed
      </button>
    </li>
  );
}

/**
 * Tag tab
 *
 * @example
 * <TagFilterTab />
 */
function TagFilterTab(): JSX.Element {
  const tag = useAppSelector((state) => state.articleList.tag);

  if (!tag) {
    return <></>;
  }

  return (
    <li className="nav-item">
      <button type="button" className="nav-link active">
        <i className="ion-pound" /> {tag}
      </button>
    </li>
  );
}

/**
 * Show the tab navigation and the list of articles
 *
 * @example
 * <MainView />
 */
function MainView(): JSX.Element {
  return (
    <div className="col-md-9">
      <div className="feed-toggle">
        <ul className="nav nav-pills outline-active">
          <YourFeedTab />

          <GlobalFeedTab />

          <TagFilterTab />
        </ul>
      </div>

      <ArticleList />
    </div>
  );
}

export default memo(MainView);
