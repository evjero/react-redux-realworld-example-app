import { EntityId } from '@reduxjs/toolkit';

const API_ROOT =
  process.env.REACT_APP_BACKEND_URL ?? 'https://conduit.productionready.io/api';

/**
 * Serialize object to URL params
 *
 * @param {Record<string, unknown>} object
 * @returns {String}
 */
function serialize(object: Record<string, unknown>) {
  const params = [];

  for (const param in object) {
    if (Object.hasOwnProperty.call(object, param) && object[param] != null) {
      params.push(
        `${param}=${encodeURIComponent(object[param] as keyof object)}`
      );
    }
  }

  return params.join('&');
}

let token: string | undefined = undefined;

export type ApiError = { errors?: Record<string, string[]> };
export type User = {
  email: string;
  username: string;
  bio: string;
  image: string;
  token: string;
  password: string;
};
export type UserAuth = {
  user: User;
};
export type UpdateUserRequest = Omit<User, 'token'>;
export type Profile = {
  following: boolean;
} & Pick<User, 'username' | 'bio' | 'image'>;
export type Tags = {
  tags: string[];
};
export type Article = {
  title: string;
  slug: string;
  body: string;
  description: string;
  tagList: string[];
  author: Profile;
  favorited: boolean;
  favoritesCount: number;
  createdAt: string; //Date
  updatedAt: string; //Date
};
export type ArticleResponse = {
  article: Article;
};
export type ArticlesResponse = {
  articles: Article[];
  articlesCount: number;
};
export type Comment = {
  id: string;
  body: string;
  author: Profile;
  createdAt: string;
  updatedAt: string;
};
export type CommentResponse = {
  comment: Comment;
};
export type CommentsResponse = {
  comments: Comment[];
};
export type ProfileResponse = {
  profile: Profile;
};

export type HTTPRequestHeader = 'GET' | 'DELETE' | 'PUT' | 'POST';

/**
 * API client
 *
 * @param url The endpoint
 * @param body The request's body
 * @param The request's method; defaulted to GET
 *
 * @throws {@link ApiError API Error}
 *
 * @returns {Promise<Object>} API response's body
 */
const agent = async (
  url: string,
  body?: Record<string, unknown>,
  method: HTTPRequestHeader = 'GET'
) => {
  const headers = new Headers();

  if (body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  const response = await fetch(`${API_ROOT}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let result;

  try {
    result = await response.json();
  } catch (error) {
    result = { errors: { [response.status]: [response.statusText] } };
  }

  if (!response.ok) throw result;

  return result;
};

export type QueryParams = {
  limit?: number;
  page?: number;
  author?: string;
  tag?: string;
  favorited?: String;
  username?: string;
  [key: string]: unknown;
};

export type Meta<T = unknown> = {
  arg: T;
  requestId: EntityId;
  requestStatus: 'fulfilled' | 'rejected' | 'rejectWithValue';
};

const requests = {
  /**
   * Send a DELETE request
   *
   * @param url The endpoint
   */
  del: (url: string) => agent(url, undefined, 'DELETE'),
  /**
   * Send a GET request
   *
   * @param url The endpoint
   * @param query The query parameters
   */
  get: (url: string, query: QueryParams = {}) => {
    if (Number.isSafeInteger(query?.page)) {
      query.limit = query.limit ? query.limit : 10;
      query.offset = query.page ? query.page * query.limit : undefined;
    }
    delete query.page;
    const isEmptyQuery = query == null || Object.keys(query).length === 0;

    return agent(isEmptyQuery ? url : `${url}?${serialize(query)}`);
  },
  /**
   * Send a PUT request
   *
   * @param url The endpoint
   * @param  body The request's body
   */
  put: (url: string, body: Record<string, unknown>) => agent(url, body, 'PUT'),
  /**
   * Send a POST request
   *
   * @param url The endpoint
   * @param body The request's body
   */
  post: (url: string, body?: Record<string, unknown>) =>
    agent(url, body, 'POST'),
};

const Auth = {
  /**
   * Get current user
   *
   * @returns {Promise<UserAuth>}
   */
  current: () => requests.get('/user'),
  /**
   * Login with email and password
   */
  login: (email: string, password: string): Promise<UserAuth> =>
    requests.post('/users/login', { user: { email, password } }),
  /**
   * Register with username, email and password
   */
  register: (
    username: string,
    email: string,
    password: string
  ): Promise<UserAuth> =>
    requests.post('/users', { user: { username, email, password } }),
  /**
   * Update user
   */
  save: (user: Partial<UpdateUserRequest>): Promise<UserAuth> =>
    requests.put('/user', { user }),
};

const Tags = {
  /**
   * Get all tags
   *
   * @returns {Promise<Tags>}
   */
  getAll: (): Promise<Tags> => requests.get('/tags'),
};

const Articles = {
  /**
   * Get all articles
   *
   * @param query Article's query parameters
   */
  all: (query: QueryParams): Promise<ArticlesResponse> =>
    requests.get(`/articles`, query),
  /**
   * Get all articles from author
   *
   * @param author Article's author
   */
  byAuthor: (author: string, page: number): Promise<ArticlesResponse> =>
    requests.get(`/articles`, { author, limit: 5, page }),
  /**
   * Get all articles by tag
   *
   * @param tag Article's tag
   */
  byTag: (tag: string, page: number): Promise<ArticlesResponse> =>
    requests.get(`/articles`, { tag, page }),
  /**
   * Remove one article
   *
   * @param slug Article's slug
   */
  del: (slug: string): Promise<void> => requests.del(`/articles/${slug}`),
  /**
   * Favorite one article
   *
   * @param slug Article's slug
   */
  favorite: (slug: string): Promise<ArticleResponse> =>
    requests.post(`/articles/${slug}/favorite`),
  /**
   * Get article favorited by author
   *
   * @param username Username
   */
  favoritedBy: (username: string, page: number): Promise<ArticlesResponse> =>
    requests.get(`/articles`, { favorited: username, limit: 5, page }),
  /**
   * Get all articles in the user's feed
   */
  feed: (page: number): Promise<ArticlesResponse> =>
    requests.get('/articles/feed', { page }),
  /**
   * Get one article by slug
   *
   * @param slug Article's slug
   */
  get: (slug: string): Promise<ArticleResponse> =>
    requests.get(`/articles/${slug}`),
  /**
   * Unfavorite one article
   *
   * @param slug Article's slug
   */
  unfavorite: (slug: string): Promise<ArticleResponse> =>
    requests.del(`/articles/${slug}/favorite`),
  /**
   * Update one article
   */
  update: ({ slug, ...article }: Partial<Article>): Promise<ArticleResponse> =>
    requests.put(`/articles/${slug}`, { article }),
  /**
   * Create a new article
   */
  create: (article: Partial<Article>): Promise<ArticleResponse> =>
    requests.post('/articles', { article }),
};

const Comments = {
  /**
   * Create a new comment for article
   *
   * @param slug Article's slug
   */
  create: (slug: string, comment: Partial<Comment>): Promise<CommentResponse> =>
    requests.post(`/articles/${slug}/comments`, { comment }),
  /**
   * Remove one comment
   *
   * @param slug Article's slug
   * @param commentId Comment's id
   */
  delete: (slug: string, commentId: number): Promise<void> =>
    requests.del(`/articles/${slug}/comments/${commentId}`),
  /**
   * Get all comments for one article
   *
   * @param slug Article's slug
   */
  forArticle: (slug: string): Promise<CommentsResponse> =>
    requests.get(`/articles/${slug}/comments`),
};

const Profile = {
  /**
   * Follow another user
   *
   * @param username User's username
   */
  follow: (username: string): Promise<ProfileResponse> =>
    requests.post(`/profiles/${username}/follow`),
  /**
   * Get the profile of an user
   *
   * @param  username User's username
   */
  get: (username: string) => requests.get(`/profiles/${username}`),
  /**
   * Unfollow another user
   *
   * @param username User's username
   */
  unfollow: (username: string): Promise<ProfileResponse> =>
    requests.del(`/profiles/${username}/follow`),
};

export default {
  Articles,
  Auth,
  Comments,
  Profile,
  Tags,
  setToken: (_token?: string) => {
    token = _token;
  },
};
