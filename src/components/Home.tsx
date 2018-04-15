import S from 's-js';
import * as Surplus from "surplus";

import { App } from "../app/app";
import { User, Article, ArticlesResponse, ArticlesQuery } from "../app/client";

import { Page, MenuSection } from "./Page";
import { Loading } from './Loading';
import { ArticlesToggle, PaginatedArticleFeed } from './ArticlesFeed';

export { HomeRoute };

type HomeModel = ReturnType<typeof HomeModel>;
const 
    HomeRoute = async (app : App) => {
        const model = HomeModel(app);
        return () => <HomePage {...model} />
    },
    HomeModel = (app : App) => {
        const 
            tab = S.data(S.sample(app.isAuthenticated) ? 'your' : 'all'), // 'your' | 'all' | '#tag'
            tag = () => tab()[0] === '#' ? tab().substr(1) : undefined,
            feed = () => {
                const endpoint = tab() === 'your' ? app.client.feed : app.client.articles,
                    filter = tag() ? { tag: tag() } : {};
                return (q : ArticlesQuery) => endpoint.get({ ...q, ...filter });
            },
            tags = app.client.tags.get();

        return { app, tab, tag, feed, tags };
    },
    HomePage = (model : HomeModel) => (
        <Page app={model.app} title="Home - Conduit" section={MenuSection.Home}>
            <Home {...model} />
        </Page>
    ),
    Home = ({ tab, tag, feed, tags, app: { isAuthenticated, client } } : HomeModel) => (
        <div class="home-page">
            <div class="banner" hidden={isAuthenticated()}>
                <div class="container">
                    <h1 class="logo-font">conduit</h1>
                    <p>A place to share your knowledge.</p>
                </div>
            </div>

            <div class="container page">
                <div class="row">
                    <div class="col-md-9">
                        <ArticlesToggle tab={tab}>{{
                            ...(isAuthenticated() ? { your: 'Your Feed '}: {}),
                            all: 'Global Feed',
                            ...(tag() ? { [tab()] : [<i class="ion-pound" />, " ", tag()]}: {})
                        }}</ArticlesToggle>

                        <PaginatedArticleFeed size={10} feed={feed()} client={client} />
                    </div>

                    <div class="col-md-3">
                        <div class="sidebar">
                            <p>Popular Tags</p>

                            <Loading task={() => tags} placeholder="Loading tags...">
                                {data =>
                                    <div class="tag-list">
                                        {data.tags.map(tag => 
                                            <a href="" class="tag-pill tag-default" onClick={() => (tab('#' + tag), false)}>
                                                {tag}
                                            </a>
                                        )}
                                    </div>
                                }
                            </Loading>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
