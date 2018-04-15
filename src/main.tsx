import S from 's-js';
import * as Surplus from 'surplus';

import { App } from './app/app';

import { AppContainer } from './components/AppContainer';
import { HomeRoute } from './components/Home';
import { LoginRoute } from './components/Login';
import { RegisterRoute } from './components/Register';
import { SettingsRoute } from './components/Settings';
import { EditorRoute } from './components/Editor';
import { ArticleRoute } from './components/Article';
import { ProfileRoute } from './components/Profile';
import { LogoutRoute } from './components/Logout';

import { AsyncRouter } from './app/asyncRouter';

// Nootstrap our application
// this is the only call to S.root() in the application: all other computations descend from it
S.root(() => {
    const
        // construct app-wide state and services 
        app = App(),
        // create our router and routing table, returning a signal of our top-level page view
        // we change routes on a location change (see ./app/hashSignal), aka a "push" onto the
        // history stack.  This allows routes to replace the current route to represent changes
        // in their internal state without re-triggering the router.  See /profile, which replaces 
        // the route to reflect that the user is on the favorites tab.
        page = AsyncRouter(app.location.change, () => null, [
            // a "route" consists of a regex matching the location, a function to pull out params, 
            // and a route function which takes `app` and the params
            [ /^#\/@([^/]*)\/?(favorites)?/, ([, user, fav ]) => ProfileRoute(app, user, !!fav) ],
            [ /^#\/article\/(.*)/          , ([, slug ])      => ArticleRoute(app, slug) ],
            // /editor and /settings require the user to be authenticated
            [ /^#\/editor\/?(.*)/          , ([, slug ])      => app.requireAuth(EditorRoute)(app, slug) ],
            [ /^#\/settings/               , ()               => app.requireAuth(SettingsRoute)(app) ],
            [ /^#\/login/                  , ()               => LoginRoute(app) ],
            [ /^#\/register/               , ()               => RegisterRoute(app) ],
            [ /^#?$/                       , ()               => HomeRoute(app) ],
            [ /^#\/logout/                 , ()               => LogoutRoute(app) ]
        ]);

    // insert view into page, wrapped by main app container
    document.body.appendChild(
        <AppContainer app={app}>
            {page}
        </AppContainer>
    );
});