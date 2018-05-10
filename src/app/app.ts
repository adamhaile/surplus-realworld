import S from 's-js';
import { User } from './client';
import { ConfigStore } from './configStore';
import { TokenStore } from './TokenStore';
import { Client, isAuthFailure } from './client';
import { AuthMonitor } from './authMonitor';
import { AuthClient } from './authClient';
import { HashSignal } from './hashSignal';

/**
 * App - core state and services available to all routes
 * 
 * Essential system-wide state and services like whether we're authenticated, our location,
 * our client instance, etc.
 */
export type App = ReturnType<typeof App>;
export const App = () => {
    const
        config          = ConfigStore(),
        user            = S.value(null as User | null),
        token           = TokenStore(user),
        baseClient      = Client(config.Server, token),
        isAuthenticated = () => !!token(),
        login           = async (u : string, p : string) => user((await baseClient.login.post(u, p)).user)!,
        logout          = async () => { user(null); },
        auth            = AuthMonitor<User>(isAuthenticated, isAuthFailure, login),
        client          = AuthClient(baseClient, auth),
        location        = HashSignal();

    // cancel any credential request when location changes
    S.on(location.change, auth.cancelCredentials);

    return { user, isAuthenticated, login, logout, ...auth, location, client, init: init() };

    // request initial data, here just the user
    async function init() : Promise<void> {
        if (!token()) return;
        const resp = await baseClient.user.get();
        user(resp.user);
    }
};

