import S from 's-js';
import SArray from 's-array';
import * as Surplus from "surplus";
import data from 'surplus-mixin-data';
import * as marked from 'marked';

import { App } from '../app/app';
import { Article, Comment, User, Client, UserProfile, CommentResponse, CommentsResponse } from '../app/client';

import { Page, MenuSection } from "./Page";
import { TagList } from './TagList';
import { FavoriteButton } from './FavoriteButton';
import { FollowButton } from './FollowButton';

export { ArticleRoute };

type ArticleModel = ReturnType<typeof ArticleModel>;
const 
    ArticleRoute = async (app : App, slug : string) => {
        const commentReq = app.client.comments.get(slug),
            { article } = await app.client.article.get(slug),
            model = ArticleModel(app, article, commentReq, () => app.location.change('#'));
        return () => <ArticlePage {...model} />;
    },
    ArticleModel = (app : App, _article : Article, commentsReq : Promise<CommentsResponse>, onDelete: () => void) => {
        const article = S.data(_article),
            author = S.data(_article.author),
            comments = SArray<Comment>([]),
            newCommentBody = S.data(""),
            postComment = () => {
                app.client.comments.post(_article.slug, newCommentBody())
                .then(r => {
                    newCommentBody("");
                    comments.unshift(r.comment);
                });
                return false;
            },
            deleteArticle = () => {
                app.client.article.del(_article.slug)
                .then(onDelete);
                return false;
            },
            canDeleteComment = (c : Comment) => app.user() && c.author.username === app.user()!.username,
            deleteComment = (c : Comment) => {
                app.client.comment.del(_article.slug, c.id)
                .then(() => {
                    comments.remove(c);
                });
                return false;
            }


        return { app, article, author, comments, newCommentBody, postComment, deleteArticle, canDeleteComment, deleteComment };
    },
    ArticlePage = (model : ArticleModel) => (
        <Page app={model.app} title={() => `${model.article().title || 'loading...'} - Conduit`} section={MenuSection.None}>
            <Article {...model}/>
        </Page>
    ),
    Article = (props : ArticleModel) => (
        <div class="article-page">
            <div class="banner">
                <div class="container">
                    <h1>{props.article().title}</h1>

                    <ArticleMeta {...props} />
                </div>
            </div>

            <div class="container page">
                <div class="row article-content">
                    <div class="col-xs-12">
                        <div fn={el => el.innerHTML = marked(props.article().body)} />
                        
                        <TagList {...props.article().tagList} />
                    </div>
                </div>

                <hr />

                <div class="article-actions">
                    <ArticleMeta {...props} />
                </div>

                <div class="row">
                    <div class="col-xs-12 col-md-8 offset-md-2">
                        { props.app.isAuthenticated()
                          ? <form class="card comment-form" onSubmit={props.postComment}>
                                <div class="card-block">
                                    <textarea
                                        fn={data(props.newCommentBody)}
                                        class="form-control"
                                        placeholder="Write a comment..."
                                        rows={3}
                                    />
                                </div>
                                <div class="card-footer">
                                    <img
                                        src={props.app.user() && props.app.user()!.image || '//:0'}
                                        class="comment-author-img"
                                    />
                                    <button class="btn btn-sm btn-primary">
                                        Post Comment
                                    </button>
                                </div>
                            </form>
                          : <p>
                                <a href="#/login">Sign in</a> or <a href="#/register">sign up</a> to add comments on this article.
                            </p> 
                        }

                        {props.comments.map(c => Comment(props, c)) as any as JSX.Child}
                    </div>
                </div>
            </div>
        </div>
    ),
    ArticleMeta = ({ author, article, deleteArticle, app: { user, client} } : ArticleModel) => (
        <div class="article-meta">
            <a href={`#/@${author().username}`}>
                <img src={author().image || '//:0'} />
            </a>
            <div class="info">
                <a href={`#/@${author().username}`} class="author">
                    {author().username}
                </a>
                <span class="date">{article().createdAt && new Date(article().createdAt).toDateString()}</span>
            </div>
            { user() && user()!.username === author().username ? [
                <a class="btn btn-sm btn-outline-secondary" href={`#/editor/${article().slug}`}>
                    <i class="ion-edit" /> 
                    &nbsp; Edit Article
                </a>,
                "  ",
                <button class="btn btn-sm btn-outline-danger" type="button" onClick={deleteArticle}>
                    <i class="ion-trash-a" /> 
                    &nbsp; Delete Article
                </button>
             ] : [
                FollowButton(author, client),
                "  ",
                FavoriteButton(article, client)
             ]}
        </div>
    ),
    Comment = (props : ArticleModel, comment : Comment) => (
        <div class="card">
            <div class="card-block">
                <p class="card-text">
                    {comment.body}
                </p>
            </div>
            <div class="card-footer">
                <a href={`#/@${comment.author.username}`} class="comment-author">
                    <img
                        src={comment.author.image || '//:0'}
                        class="comment-author-img"
                    />
                </a>
                &nbsp;
                <a href={`#/@${comment.author.username}`} class="comment-author">
                    {comment.author.username}
                </a>
                <span class="date-posted">{new Date(comment.createdAt).toDateString()}</span>
                {props.canDeleteComment(comment) && <span class="mod-options">
                    <i class="ion-trash-a" onClick={() => props.deleteComment(comment)}></i>
                </span>}
            </div>
        </div>
    )

