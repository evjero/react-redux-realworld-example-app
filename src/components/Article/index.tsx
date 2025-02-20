import React, { lazy, memo, Suspense, useEffect } from 'react';
import { useParams } from 'react-router';
import snarkdown from 'snarkdown';
import xss from 'xss';

import TagsList from '../../features/tags/TagsList';
import { articlePageUnloaded, getArticle } from '../../reducers/article';
import ArticleMeta from './ArticleMeta';
import type { RootState } from '../../app/store';
import { useAppSelector, useAppDispatch } from '../../app/hooks';

const CommentSection = lazy(
  () =>
    import(
      /* webpackChunkName: "CommentSection", webpackPrefetch: true  */ '../../features/comments/CommentSection'
    )
);

type Props = { [property: string]: unknown };

/**
 * Show one article with its comments
 *
 * @example
 * <Article />
 */
function Article({ match }: Props): JSX.Element {
  const article = useAppSelector((state: RootState) => state.article.article);
  const inProgress = useAppSelector(
    (state: RootState) => state.article.inProgress
  );
  const { slug } = useParams();
  const renderMarkdown = () =>
    article ? { __html: xss(snarkdown(article.body)) } : undefined;

  useEffect(() => {
    if (slug) {
      const fetchArticle = useAppDispatch(getArticle(slug));
      return () => {
        fetchArticle.abort();
      };
    }
  }, [match]);

  useEffect(() => {
    return () => {
      useAppDispatch(articlePageUnloaded());
    };
  }, []);

  if (!article) {
    return (
      <div className="article-page">
        <div className="container page">
          <div className="row article-content">
            <div className="col-xs-12">
              {inProgress && <h1 role="alert">Article is loading</h1>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          <ArticleMeta />
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-xs-12">
            <article dangerouslySetInnerHTML={renderMarkdown()} />

            <TagsList tags={article.tagList} />
          </div>
        </div>

        <hr />

        <Suspense fallback={<p>Loading comments</p>}>
          <CommentSection />
        </Suspense>
      </div>
    </div>
  );
}

export default memo(Article);
