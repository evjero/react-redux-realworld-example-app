import React, { memo } from 'react';
import { useAppSelector } from '../../app/store';

import { selectIsAuthenticated } from '../../features/auth/authSlice';

/**
 * Shows a banner for new users
 *
 * @example
 * <Banner />
 */
function Banner(): JSX.Element {
  const appName = useAppSelector((state) => state.common.appName);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <></>;
  }

  return (
    <div className="banner">
      <div className="container">
        <h1 className="logo-font">{appName.toLowerCase()}</h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>
  );
}

export default memo(Banner);
