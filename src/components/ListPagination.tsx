import React, { memo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';

import { getAllArticles } from '../reducers/articleList';

/**
 * Show a list with the available pages
 *
 * @example
 * <ListPagination />
 */
function ListPagination(): JSX.Element {
  const articlesCount = useAppSelector(
    (state) => state.articleList.articlesCount
  );
  const currentPage = useAppSelector((state) => state.articleList.currentPage);
  const articlesPerPage = useAppSelector(
    (state) => state.articleList.articlesPerPage
  );

  if (articlesCount <= articlesPerPage) {
    return <></>;
  }

  const pages = Array.from(
    { length: Math.ceil(articlesCount / articlesPerPage) },
    (_, number) => number
  );

  const handleClickPage = (page: number) => () => {
    useAppDispatch(getAllArticles({ page }));
  };

  return (
    <nav>
      <ul className="pagination">
        {pages.map((page) => {
          const isActivePage = page === currentPage;

          return (
            <li
              className={isActivePage ? 'page-item active' : 'page-item'}
              onClick={handleClickPage(page)}
              key={page.toString()}
            >
              <button type="button" className="page-link">
                {page + 1}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default memo(ListPagination);
