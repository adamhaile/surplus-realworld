import S from 's-js';

/**
 * Re-usable model for toggle widgets.  Optimistically changes to desired state while save to server is still executing.
 * 
 * @param on - boolean signal for whether toggle is on or off 
 * @param count - number signal indicating how many of such toggles are on.  If not needed, simply use `() => 0`
 * @param save  - async method to save new toggle state to server
 */
export const OptimisticToggle = (_on : () => boolean, _count : () => number, save : (on : boolean) => Promise<any>) => {
    let // while we're issuing request(s) to server, we'll optimistically use these local data signals to store state
        optimisticOn = S.value(false),
        optimisticCount = S.value(0),
        // toggle saves are serialized to avoid them crossing on the wire
        requestChain = Promise.resolve<any>(null),
        // number of requests still pending
        openRequests = S.data(0),
        // depending on whether we're currently saving or not, use either our optimistic signals or base ones
        on = () => openRequests() ? optimisticOn() : _on(),
        count = () => openRequests() ? optimisticCount() : _count(),
        // optimistically toggle state
        toggle = () => S.sample(async () => {
            const fav = optimisticOn(!on());
            optimisticCount(count() + (fav ? 1 : -1));
            openRequests(openRequests() + 1);
            requestChain = requestChain.then(() => save(fav))
            try {
                await requestChain;
            } finally {
                openRequests(openRequests() - 1);
            }
        });
        
    // return our optimistic on and count signals, a toggle function, and a flag saying whether a save is in progress
    return { on, count, toggle, saving : () => openRequests() > 0 };
};