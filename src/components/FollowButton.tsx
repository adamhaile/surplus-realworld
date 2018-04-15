import { DataSignal } from 's-js';
import * as Surplus from 'surplus';

import { UserProfile, Client } from '../app/client';

import { OptimisticToggle } from './OptimisticToggle';

export const FollowButton = (profile : DataSignal<UserProfile>, client : Client) => {
    const { on, toggle, saving } = OptimisticToggle(
        () => profile().following,
        () => 0,
        fol => client.follow[fol ? 'post' : 'del'](profile().username).then(p => profile(p.profile))
    );
    return (
        <button class={`btn btn-sm ${on() ? 'btn-secondary' : 'btn-outline-secondary'} ${saving() ? 'disabled' : ''} action-btn`} onClick={toggle}>
            <i class="ion-plus-round" />
            &nbsp; {on() ? 'Unfollow' : 'Follow'} {profile().username}
        </button>
    );
}