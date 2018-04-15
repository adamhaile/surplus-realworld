import S from "s-js";
import * as Surplus from "surplus";
import data from "surplus-mixin-data";

import { App } from "../app/app";

import { Page, MenuSection } from "./Page";
import { RequestErrors } from "./RequestErrors";

export { RegisterRoute };

type RegisterModel = ReturnType<typeof RegisterModel>;
const RegisterRoute = async (app: App) => {
        const model = RegisterModel(app, () => app.location.change("#"));
        return () => <RegisterPage {...model} />;
    },
    RegisterModel = (app: App, onRegister: () => void) => {
        const name = S.data(""),
            email = S.data(""),
            password = S.data(""),
            request = S.data(null as Promise<any> | null);

        return { app, name, email, password, register, request };

        async function register() {
            await request(app.client.users.post(name(), email(), password()));
            onRegister();
        }
    },
    RegisterPage = (model: RegisterModel) => (
        <Page app={model.app} title="Sign up - Conduit" section={MenuSection.SignUp}>
            <Register {...model} />
        </Page>
    ),
    Register = ({ name, email, request, password, register }: RegisterModel) => (
        <div class="auth-page">
            <div class="container page">
                <div class="row">
                    <div class="col-md-6 offset-md-3 col-xs-12">
                        <h1 class="text-xs-center">Sign up</h1>
                        <p class="text-xs-center">
                            <a href="#/login">Have an account?</a>
                        </p>

                        <RequestErrors request={request} />

                        <form>
                            <fieldset class="form-group">
                                <input
                                    fn={data(name)}
                                    class="form-control form-control-lg"
                                    type="text"
                                    placeholder="Username"
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
                                    placeholder="Password"
                                />
                            </fieldset>
                            <button
                                class="btn btn-lg btn-primary pull-xs-right"
                                type="button"
                                onClick={register}
                            >
                                Sign up
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
