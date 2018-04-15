import S, { DataSignal } from 's-js';

/**
 * Construct a data signal that tracks the hash value in the browser's location.
 * 
 * Setting the signal changes the hash and vice-versa.
 * 
 * Browser location can be set two ways: a replace or an assign. We represent
 * that as two data signals, hash() and hash.change().  The first tracks all changes 
 * to the location, whether a replace or an assign, while the second tracks only 
 * assigns.  Setting hash() replaces the location, setting change() assigns a new one.
 */
export interface HashSignal extends DataSignal<string> {
    change : DataSignal<string>
}
export const HashSignal = () => {
    const 
        // we need to detect sets to the data signals so that we can also change the 
        // window location, so we make underlying data signals and wrap them
        _hash = S.data(window.location.hash), 
        _change = S.data(window.location.hash),
        // setting hash also replaces current location in browser
        hash = ((loc? : string) => loc === undefined ? _hash() : set(loc, false)) as HashSignal,
        // setting change also sets hash and assigns a new location in browser
        change = ((loc? : string) => loc === undefined ? _change() : set(loc, true)) as DataSignal<string>,
        set = (loc: string, isChange : boolean) => S.freeze(() => {
            _hash(loc);
            if (isChange) _change(loc);
            window.location[isChange ? 'assign' : 'replace'](loc);
            return loc;
        });

    hash.change = change;

    // change from the other direction: set signals when a hashchange event occurs
    const onHashChange = () => S.freeze(() => { 
        if ((window.location.hash || '#') !== _hash())
            _hash(_change(window.location.hash));
    });
    window.addEventListener('hashchange', onHashChange);
    S.cleanup(() => window.removeEventListener('hashchange', onHashChange));

    return hash;
};