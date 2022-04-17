import React, { useState, useEffect, memo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';

import ListErrors from './ListErrors';
import {
  getArticle,
  createArticle,
  updateArticle,
  articlePageUnloaded,
} from '../reducers/article';
import { useNavigate, useParams } from 'react-router';
import { Article } from '../agent';

/**
 * Editor component
 *
 * @example
 * <Editor />
 */
function Editor(): JSX.Element {
  const { article, errors, inProgress } = useAppSelector(
    (state) => state.article
  );
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const navigate = useNavigate();

  const changeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const changeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const changeBody = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
  };

  const changeTagInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };

  /**
   * Reset the form values
   */
  const reset = (): void => {
    if (slug && article) {
      setTitle(article.title);
      setDescription(article.description);
      setBody(article.body);
      setTagList(article.tagList);
    } else {
      setTitle('');
      setDescription('');
      setBody('');
      setTagInput('');
      setTagList([]);
    }
  };

  const addTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (tagInput && !tagList.includes(tagInput))
        setTagList([...tagList, tagInput]);

      setTagInput('');
    }
  };

  /**
   * Remove a tag from tagList
   *
   * @returns {React.MouseEventHandler}
   */
  const removeTag = (tag: string) => () => {
    setTagList(tagList.filter((_tag) => _tag !== tag));
  };

  const submitForm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const article: Partial<Article> = {
      slug,
      title,
      description,
      body,
      tagList,
    };

    useAppDispatch(slug ? updateArticle(article) : createArticle(article));
    navigate('/');
  };

  useEffect(() => {
    reset();
    if (slug) {
      useAppDispatch(getArticle(slug));
    }
  }, [slug]);

  useEffect(reset, [article]);

  useEffect(() => {
    return () => {
      useAppDispatch(articlePageUnloaded());
    };
  }, []);

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <ListErrors errors={errors} />

            <form>
              <fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Article Title"
                    value={title}
                    onChange={changeTitle}
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="What's this article about?"
                    value={description}
                    onChange={changeDescription}
                  />
                </fieldset>

                <fieldset className="form-group">
                  <textarea
                    className="form-control"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                    value={body}
                    onChange={changeBody}
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter tags"
                    value={tagInput}
                    onChange={changeTagInput}
                    onKeyUp={addTag}
                  />

                  <div className="tag-list">
                    {tagList.map((tag) => {
                      return (
                        <span className="tag-default tag-pill" key={tag}>
                          <i
                            className="ion-close-round"
                            onClick={removeTag(tag)}
                          />
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </fieldset>

                <button
                  className="btn btn-lg pull-xs-right btn-primary"
                  type="button"
                  disabled={inProgress}
                  onClick={submitForm}
                >
                  Publish Article
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Editor);
