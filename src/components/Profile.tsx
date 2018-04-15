import S, { DataSignal } from 's-js';
import * as Surplus from 'surplus';

import { App } from '../app/app';
import { ArticlesQuery, UserProfile, Client } from '../app/client';

import { Page, MenuSection } from './Page';
import { PaginatedArticleFeed, ArticlesToggle } from './ArticlesFeed';
import { FollowButton } from './FollowButton';
import { Loading } from './Loading';

export { ProfileRoute };

type ProfileModel = ReturnType<typeof ProfileModel>;
const 
    ProfileRoute = async (app : App, user : string, favorites : boolean) => {
        const model = ProfileModel(app, user, favorites);
        S(() => app.location(`#/@${user}${model.tab() === 'favorites' ? '/favorites' : ''}`));
        return () => <ProfilePage {...model} />;
    },
    ProfileModel = (app : App, username : string, favorites : boolean) => {
        const 
            tab = S.value(favorites ? 'favorites' : 'my'),
            profile = S.data({} as UserProfile),
            isUser = () => app.user() && app.user()!.username === username,
            request = app.client.profiles.get(username),
            feed = () => {
                const filter = tab() === 'my' ? { author: username} : { favorited : username };
                return (q : ArticlesQuery) => app.client.articles.get({ ...q, ...filter });
            };

        request.then(resp => profile(resp.profile));
        
        return { app, tab, username, isUser, profile, feed };
    },
    ProfilePage = (props: ProfileModel) => (
        <Page app={props.app} title={`@${props.username} - Conduit`} section={props.isUser() ? MenuSection.Profile : MenuSection.None}>
            <Profile {...props} />
        </Page>
    ),
    Profile = (props : ProfileModel) => (
        <div class="profile-page">
            <UserInfo {...props} />
            <div class="container">
                <div class="row">
                    <div class="col-xs-12 col-md-10 offset-md-1">

                        <ArticlesToggle tab={props.tab}>{{
                            my: 'My Articles',
                            favorites: 'Favorited Articles'
                        }}</ArticlesToggle>

                        <PaginatedArticleFeed size={10} feed={props.feed()} client={props.app.client} />
                    </div>
                </div>
            </div>
        </div>
    ),
    UserInfo = ({ profile, isUser, app: { client, user } } : ProfileModel) => (
        <div class="user-info">
            <div class="container">
                <div class="row">
                    <div class="col-xs-12 col-md-10 offset-md-1">
                        <img class="user-img" src={profile().image || '//:0'} />
                        <h4>{profile().username}</h4>
                        <p>{profile().bio}</p>
                        {isUser()
                          ? <a class="btn btn-sm btn-outline-secondary action-btn" href="#/settings">
                                <i class="ion-gear-a"></i> Edit Profile Settings
                            </a>
                          : FollowButton(profile, client)}
                    </div>
                </div>
            </div>
        </div>
    );

