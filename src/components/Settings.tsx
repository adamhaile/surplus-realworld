import S from 's-js';
import * as Surplus from "surplus";
import data from 'surplus-mixin-data';

import { App } from "../app/app";
import { User } from '../app/client';

import { Page, MenuSection } from "./Page";
import { RequestErrors } from './RequestErrors';

export { SettingsRoute };

type SettingsModel = ReturnType<typeof SettingsModel>;
const 
    SettingsRoute = async (app : App) => {
        await app.init;
        const user = app.user()!;
        const model = SettingsModel(app, user, u => app.location.change(`#/@${u.username}`));
        return () => <SettingsPage {...model} />;
    },
    SettingsModel = (app : App, user : User, onUpdate : (u : User) => void) => {
        const image = S.data(user.image),
            username = S.data(user.username),
            bio = S.data(user.bio),
            email = S.data(user.email),
            password = S.data(''),
            request = S.data(null as null | Promise<any>),
            update = async () => {
                const { user } = await request(app.client.user.put({ 
                    username: username(),
                    image: image(),
                    bio: bio(),
                    email: email(),
                    password: password() || undefined
                }));
                app.user(user);
                onUpdate(user);
            };
            
        return { app, image, username, bio, email, password, request, update };
    },
    SettingsPage = (model : SettingsModel) => (
        <Page app={model.app} title="Settings - Conduit" section={MenuSection.Settings}>
            <Settings {...model}/>
        </Page>
    ),
    Settings = ({ image, email, bio, username, password, update, request } : SettingsModel) => (
        <div class="settings-page">
            <div class="container page">
                <div class="row">
                    <div class="col-md-6 offset-md-3 col-xs-12">
                        <h1 class="text-xs-center">Your Settings</h1>

                        <RequestErrors request={request} />

                        <form>
                            <fieldset>
                                <fieldset class="form-group">
                                    <input
                                        fn={data(image)}
                                        class="form-control"
                                        type="text"
                                        placeholder="URL of profile picture"
                                    />
                                </fieldset>
                                <fieldset class="form-group">
                                    <input
                                        fn={data(username)}
                                        class="form-control form-control-lg"
                                        type="text"
                                        placeholder="Username"
                                    />
                                </fieldset>
                                <fieldset class="form-group">
                                    <textarea
                                        fn={data(bio)}
                                        class="form-control form-control-lg"
                                        rows={8}
                                        placeholder="Short bio about you"
                                    />
                                </fieldset>
                                <fieldset class="form-group">
                                    <input
                                        fn={data(email)}
                                        class="form-control form-control-lg"
                                        type="text"
                                        placeholder="Email"
                                    />
                                </fieldset>
                                <fieldset class="form-group">
                                    <input
                                        fn={data(password)}
                                        class="form-control form-control-lg"
                                        type="password"
                                        placeholder="New Password"
                                    />
                                </fieldset>
                                <button class="btn btn-lg btn-primary pull-xs-right" type="button" onClick={update}>
                                    Update Settings
                                </button>
                            </fieldset>
                        </form>

                        <hr />

                        <a class="btn btn-outline-danger" href="#/logout">
                            Or click here to logout.
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
