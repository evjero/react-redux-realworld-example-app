import React, { memo } from 'react';
import type { ApiError } from '../agent';

/**
 * List errors component
 *
 * @example
 * <ListErrors errors={{
 *    email: ["can't be blank"],
 *    password: ["can't be blank"],
 *    username: [
 *      "can't be blank",
 *      "is too short (minimum is 1 character)",
 *    ],
 * }} />
 */
function ListErrors({ errors }: ApiError): JSX.Element {
  if (!errors || Object.keys(errors).length === 0) {
    return <></>;
  }

  const errorMessages = Object.entries(errors).flatMap(([property, messages]) =>
    messages.map((message) => `${property} ${message}`)
  );

  return (
    <ul className="error-messages">
      {errorMessages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

export default memo(ListErrors);
