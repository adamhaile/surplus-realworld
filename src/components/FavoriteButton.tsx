import { DataSignal } from 's-js';
import * as Surplus from 'surplus';

import { Article, Client } from '../app/client';

import { OptimisticToggle } from './OptimisticToggle';

export { FavoriteButton, CompactFavoriteButton };

const 
    FavoriteModel = (article : DataSignal<Article>, client : Client) => 
        OptimisticToggle(
            () => article().favorited, 
            () => article().favoritesCount, 
            fav => client.favorite[fav ? 'post' : 'del'](article().slug).then(a => article(a.article))
        ),
    CompactFavoriteButton = (article : DataSignal<Article>, client : Client) => {
        const { on, count, toggle, saving } = FavoriteModel(article, client);
        return (
            <button class={`btn ${on() ? 'btn-primary' : 'btn-outline-primary'} ${saving() ? 'disabled' : ''} btn-sm pull-xs-right`}
                type="button" onClick={toggle}
            >
                <i class="ion-heart" /> {count()}
            </button>
        );
    },
    FavoriteButton = (article : DataSignal<Article>, client : Client) => {
        const { on, count, toggle, saving } = FavoriteModel(article, client);
        return (
            <button class={`btn ${on() ? 'btn-primary' : 'btn-outline-primary'} ${saving() ? 'disabled' : ''} btn-sm`}
                type="button" onClick={toggle}
            >
                <i class="ion-heart" /> {on() ? 'Unfavorite Article' : 'Favorite Article'} <span class="counter">({count()})</span>
            </button>
        );
    };