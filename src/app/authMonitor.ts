import S from 's-js';

/**
 * AuthMonitor - monitor requests for auth failures and requests a re-login when detected
 * 
 * Creates two functions:
 * - a wrapper function, requireAuth, which runs the wrapped function and watches
 *   to see if it triggers an authentication error.
 * - a signal, requireCredentials, which tells the app that an authentication error
 *   has occurred and the app should request new credentials from the user.
 */
export type AuthMonitor = ReturnType<typeof AuthMonitor>;
export const AuthMonitor = <T>(
    authenticated : () => boolean,
    isAuthFailure : (e : any) => boolean,
    login : (username : string, password : string) => Promise<T>
) => {
    // Our app code may issue multiple requests to the server which all experience
    // auth failures.  We don't want to have the user re-login for each of them, we 
    // want one login process to handle all of them.  So we cache our login task
    // here and re-use it for any requests that come in before we've finished re-
    // logging in.
    let loginTask = null as null | Promise<T>;

    // requestCreds is our flag to the app view that it needs to request a user/pw
    // from the user. `null` means no need to request creds, a validation function
    // means request creds and pass them to the function.
    const requestCredentials = S.data(null as null | typeof login);

    return { requestCredentials, requireAuth, cancelCredentials };

    // authenticate() returns a promise which won't complete until the user has 
    // successfully logged in, even if that takes several tries by the user
    function authenticate() {
        return loginTask = loginTask || new Promise<T>(resolve =>
            requestCredentials(async (username, password) => {
                const u = await login(username, password);
                if (loginTask !== null) {
                    loginTask = null;
                    requestCredentials(null);
                    resolve(u);
                }
                return u;
            })
        );
    }

    /**
     * requireAuth() takes a function and returns a wrapped function with an identical call signature.
     * The wrapped function detects auth failures -- rejected Promises whose rejection value matches 
     * isAuthFailure -- and calls for a login when it detects a potential or actual auth failure.
     * 
     * @param fn - the function to wrap
     */
    function requireAuth<T extends (...args : any[]) => Promise<any>>(fn : T) : T {
        return <T>(async function () {
            // if user hasn't authenticated yet, we need to do so before the first request
            if (authenticated()) {
                try {
                    return await fn(...arguments);
                } catch (e) {
                    // if request fails with an auth failure, re-authenticate() and try again.
                    if (isAuthFailure(e)) {
                        await authenticate();
                        // if we get a second auth failure we pass it through
                        return await fn(...arguments);
                    } else {
                        throw e;
                    }
                }
            } else {
                await authenticate();
                return await fn(...arguments);
            }
        });
    }

    function cancelCredentials() {
        loginTask = null;
        requestCredentials(null);
    }
}
