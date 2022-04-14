import React, { memo } from 'react';
import { Tags } from '../../agent';

/**
 * List article's tags
 *
 * @example
 * <TagsList tags={['dragons', 'training']} />
 */
function TagsList({ tags }: Tags): JSX.Element {
  return (
    <ul className="tag-list">
      {tags.map((tag) => (
        <li className="tag-default tag-pill tag-outline" key={tag}>
          {tag}
        </li>
      ))}
    </ul>
  );
}

export default memo(TagsList);
