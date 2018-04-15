import S from 's-js';
import * as Surplus from 'surplus';
import data from 'surplus-mixin-data';

import { Page, MenuSection } from './Page';
import { App } from '../app/app';
import { RequestErrors } from './RequestErrors';

export { LoginRoute, ReLoginPage };

type LoginModel = ReturnType<typeof LoginModel>;
const LoginRoute = async (app: App,) => {
        const model = LoginModel(app, () => app.location.change('#'));
        return () => <LoginPage {...model} />;
    },
    LoginModel = (app: App, onLogin : () => any) => {
        const email = S.data(""),
            password = S.data(""),
            request = S.data(null as Promise<any> | null),
            submit = () => {
                request((app.requestCredentials() || app.login)(email(), password()))!
                .then(resp => onLogin && onLogin());
                return false;
            };

        return { app, email, password, request, submit };
    },
    LoginPage = (model: LoginModel) => (
        <Page app={model.app} title="Sign in - Conduit" section={MenuSection.SignIn}>
            <Login {...model} />
        </Page>
    ),
    ReLoginPage = (app : App) =>
        LoginPage(LoginModel(app, () => null)),
    Login = (model: LoginModel) => (
        <div class="auth-page">
            <div class="container page">
                <div class="row">
                    <div class="col-md-6 offset-md-3 col-xs-12">
                        <h1 class="text-xs-center">Sign in</h1>

                        <p class="text-xs-center">
                            <a href="#/register">Need an account?</a>
                        </p>

                        <RequestErrors request={model.request} />

                        <form onSubmit={model.submit}>
                            <fieldset class="form-group">
                                <input
                                    fn={data(model.email)}
                                    class="form-control form-control-lg"
                                    type="text"
                                    placeholder="Email"
                                />
                            </fieldset>
                            <fieldset class="form-group">
                                <input
                                    fn={data(model.password)}
                                    class="form-control form-control-lg"
                                    type="password"
                                    placeholder="Password"
                                />
                            </fieldset>
                            <button class="btn btn-lg btn-primary pull-xs-right">
                                Sign in
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
