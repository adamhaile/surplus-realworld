import { Client } from './client';
import { AuthMonitor } from './authMonitor';

// annotate client methods that require authentication, so we can be sure user has
// authenticated before we attempt request, and so that we can watch for any auth
// failures indicating that our session has expired
export type AuthClient = ReturnType<typeof AuthClient>;
export const AuthClient = (client : Client, { requireAuth : auth } : AuthMonitor) : Client => {
    return {
        user: {
            get:       client.user.get,
            put:  auth(client.user.put)
        },
        users:         client.users,
        profiles:      client.profiles,
        follow: {
            post: auth(client.follow.post),
            del:  auth(client.follow.del)
        },
        login:         client.login,
        articles: {
            get:       client.articles.get,
            post: auth(client.articles.post)
        },
        article: {
            get:       client.article.get,
            put:  auth(client.article.put),
            del:  auth(client.article.del),
        },
        comments: {
            get:       client.comments.get,
            post: auth(client.comments.post),
        },
        comment: {
            del:  auth(client.comment.del),
        },
        feed: {
            get:  auth(client.feed.get),
        },
        tags:          client.tags,
        favorite: {
            post: auth(client.favorite.post),
            del:  auth(client.favorite.del),
        }
    };
}

