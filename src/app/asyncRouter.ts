import S from 's-js';

/**
 * AsyncRouter - load asynchronous top-level views from a routing table
 * 
 * At its simplest, a router transforms a stream of url strings into a stream of views, based
 * on a supplied routing table.
 * 
 * This version uses plain old regexes to match the url strings.  It passes the match to the 
 * routing function, so that it can use capture groups to identify parameters in the url.
 * 
 * Since routes may want to issue web requests before loading their views, they return a Promise.
 * More specifically, they return a Promise that creates a factory function for the view.
 * That way, any computations created for the view are owned by the router and are
 * automatically disposed when the next route comes along.
 */
export type AsyncRoute<T> = [ RegExp, (match : RegExpMatchArray) => Promise<() => T> ];

export const AsyncRouter = <T>(loc : () => string, seed : () => T, routes : AsyncRoute<T>[]) => {
    const
        // factory returned by the route's Promise
        factory = S.data(seed),
        // call the factory to get the result
        result = S(() => factory()());

    // keep track of the last routing, match, in case Promises complete out of order
    let lastMatch = null as null | RegExpExecArray;

    S(() => {
        const _loc = loc();
        for (const route of routes) {
            const match = route[0].exec(_loc);
            if (match) { 
                route[1](lastMatch = match)
                .then(result => {
                    // if we're still the current route, load our view
                    if (match === lastMatch) {
                        factory(result);
                    }
                })
                return;
            }
        }

        console.warn(`No route for ${_loc}`);
    });

    return result;
}