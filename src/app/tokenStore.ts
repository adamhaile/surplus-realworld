import S from 's-js';
import { User } from './client';

const TOKEN_KEY = 'jwtToken';

/**
 * Fetch our auth token from localStorage, and set it when user changes.
 */
export const TokenStore = (user: () => User | null) => {
    S.on(user, () => localStorage.setItem(TOKEN_KEY, user() ? user()!.token : ''), null, true);
    return () => localStorage.getItem(TOKEN_KEY) || '';
}