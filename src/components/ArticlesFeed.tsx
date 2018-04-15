import S, { DataSignal } from 's-js';
import * as Surplus from 'surplus';

import { Article, ArticlesResponse, ArticlesQuery, Client } from '../app/client';

import { PaginatedFeed } from './PaginatedFeed';
import { CompactFavoriteButton } from './FavoriteButton';
import { TagList } from './TagList';

export { ArticlesToggle, PaginatedArticleFeed };

const 
    ArticlesToggle = ({ tab, children: tabs } : { tab: DataSignal<string>, children: { [ tab: string ] : JSX.Child }}) => 
        <div class="articles-toggle">
            <ul class="nav nav-pills outline-active">
                {Object.keys(tabs).map(tabName =>
                    <li class="nav-item">
                        <a class={`nav-link ${tab() === tabName ? 'active' : ''}`} href="" onClick={() => (tab(tabName), false)}>
                            {tabs[tabName]}
                        </a>
                    </li>
                )}
            </ul>
        </div>,
    PaginatedArticleFeed = ({ size, feed, client } : { size : number, feed : (q : ArticlesQuery) => Promise<ArticlesResponse>, client : Client }) =>
        <PaginatedFeed 
            size={size} 
            feed={page => feed({ offset: page * size, limit: size }).then(a => ({ items: a.articles, total: a.articlesCount }))}
            loading={<div className="article-preview">Loading articles...</div>}
            empty={<div className="article-preview">No articles are here... yet.</div>}
        >
            {(a : Article) => ArticlePreview(S.data(a), client)}
        </PaginatedFeed>,
    ArticlePreview = (article : DataSignal<Article>, client : Client) => 
        <div class="article-preview">
            <div class="article-meta">
                <a href={`#/@${article().author.username}`}>
                    <img src={article().author.image || '//:0'} alt={article().author.username} />
                </a>
                <div class="info">
                    <a href={`#/@${article().author.username}`} class="author">
                        {article().author.username}{" "}
                    </a>
                    <span class="date">{new Date(article().createdAt).toDateString()}</span>
                </div>
                {CompactFavoriteButton(article, client)}
            </div>
            <a href={`#/article/${article().slug}`} class="preview-link">
                <h1>{article().title}</h1>
                <p>{article().description}</p>
                <span>Read more...</span>
                <TagList {...article().tagList} />
            </a>
        </div>;
