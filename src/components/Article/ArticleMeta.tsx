import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { RootState, useAppSelector } from '../../app/store';
import { selectUser } from '../../features/auth/authSlice';

import ArticleActions from './ArticleActions';

/**
 * Show information about the current article
 *
 * @example
 * <ArticleMeta />
 */
function ArticleMeta() {
  const currentUser = useAppSelector(selectUser);
  const article = useAppSelector((state: RootState) => state.article.article);
  const isAuthor = currentUser?.username === article?.author.username;

  if (!article) return null;

  return (
    <div className="article-meta">
      <Link to={`/@${article.author.username}`}>
        <img
          src={
            article.author.image ??
            'https://static.productionready.io/images/smiley-cyrus.jpg'
          }
          alt={article.author.username}
        />
      </Link>

      <div className="info">
        <Link to={`/@${article.author.username}`} className="author">
          {article.author.username}
        </Link>

        <time className="date" dateTime={article.createdAt}>
          {new Date(article.createdAt).toDateString()}
        </time>
      </div>

      {isAuthor ? <ArticleActions /> : null}
    </div>
  );
}

export default memo(ArticleMeta);
