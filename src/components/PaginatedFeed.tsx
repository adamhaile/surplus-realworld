import S, { DataSignal } from 's-js';
import * as Surplus from 'surplus';

import { Loading } from './Loading';

/**
 * Re-usable paginated feed component
 */
export interface PaginatedFeedProps<T> {
    // the size of a page, aka number of items in it
    size : number,
    // an async function for fetching the items for a given page
    feed: (page : number) => Promise<{ items: T[], total : number }>,
    // a function that maps an item to its view
    children: (item : T) => JSX.Child,
    // a placeholder to display when fetching items from server
    loading? : JSX.Children,
    // an alternate text to display when fetch returned no items
    empty? : JSX.Children
}
export function PaginatedFeed<T>({ size, feed, children, loading = 'Loading...', empty = 'No items.' } : PaginatedFeedProps<T>) {
    const page = S.value(0),
        paginatedFeed = S(() => feed(page()));

    return (
        <Loading task={paginatedFeed} placeholder={loading}>
            {resp => 
                resp.items.length === 0 ? empty :
                resp.items.map(children)
                .concat(
                    <Paginator size={size} total={resp.total} page={page} />
                )
            }
        </Loading>
    );
}

function Paginator({ size, total, page } : { size : number, total : number, page : DataSignal<number> }) {
    const pages = [...Array(Math.ceil(total / size)).keys()];
    return (
        <nav>
            <ul class="pagination">
                {pages.length > 1 && pages.map(i =>
                    <li class={"page-item " + (i === page() ? "active": "")} onClick={() => (page(i), false)}>
                        <a class="page-link" href="">{i + 1}</a>
                    </li>
                )}
            </ul>
        </nav>
    );

}