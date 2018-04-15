import * as Surplus from 'surplus';

import { App } from '../app/app';

import { ReLoginPage } from './Login';

export const AppContainer = ({ app, children } : { app : App, children: () => JSX.Children }) => (
    <div className="app">
        {/* On auth failure, display the re-login page instead of the current page until auth succeeds */}
        { app.requestCredentials() 
          ? <ReLoginPage {...app} />
          : children() }
    </div>
);