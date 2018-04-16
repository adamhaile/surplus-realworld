/**
 * Client -- everything we need to know to communicate with our backend server.
 * 
 * Contains request functions and message types for talking to Conduit server.
 */

/**
 * Messages types sent from/to server endpoints.
 */

/**
 * The current user
 */
export interface User {
    username: string,
    email   : string,
    token   : string,
    bio     : string,
    image   : string
}

/**
 * User other than current user.
 */
export interface UserProfile {
    username : string,
    bio      : string,
    image    : string,
    following: boolean
}

/**
 * Update for current user's data.
 */
export interface UserUpdate {
    username : string,
    email    : string,
    password?: string,
    bio      : string,
    image    : string
}

/**
 * An article in the system.
 */
export interface Article {
    slug          : string,
    title         : string,
    description   : string,
    body          : string,
    createdAt     : string,
    updatedAt     : string,
    tagList       : string[],
    favorited     : boolean,
    favoritesCount: number,
    author        : UserProfile
}

/**
 * Data to create a new article.
 */
export interface NewArticle {
    title         : string,
    description   : string,
    body          : string,
    tagList       : string[]
}

/**
 * Updates to an existing article
 */
export interface ArticleEdit {
    slug          : string,
    title         : string,
    description   : string,
    body          : string,
    tagList       : string[]
}

/**
 * Tag names
 */
export interface Tags {
    tags: string[]
}

/**
 * Comment on an article
 */
export interface Comment {
    id       : number,
    body     : string,
    createdAt: string,
    author   : UserProfile
}

/**
 * Query to filter articles
 */
export interface ArticlesQuery {
    limit?    : number,
    offset?   : number,
    author?   : string,
    favorited?: string,
    tag?      : string
}

/**
 * Response envelopes for various types
 */
export interface ArticlesResponse {
    articles : Article[],
    articlesCount : number
}

export interface ProfileResponse {
    profile: UserProfile
}

export interface UserResponse {
    user: User
}

export interface ArticleResponse {
    article: Article
}

export interface CommentsResponse {
    comments: Comment[]
}

export interface CommentResponse {
    comment: Comment
}

/**
 * Errors for invalid request, defined as a list of errors for a given field name
 */
export interface RequestErrors {
    errors : { [ field : string ] : string[] }
}

/**
 * Client for communicating with the conduit backend.
 * 
 * Defines all endpoints, the HTTP methods they accept, and the parameters for those requests.
 */
export type Client = ReturnType<typeof Client>;
export const Client = (server : string, token : () => string) => {
    return {
        user: {
            get : () => send<UserResponse>('GET' , '/user'),
            put : (user : UserUpdate) => send<UserResponse>('PUT' , '/user'       , { user }),
        },
        login: {
            post: (e : string, p : string) => send<UserResponse>('POST', '/users/login', { user : { email: e, password: p } })
        },
        users: {
            post: (u : string, e : string, p : string) => send<User>('POST', '/users'      , { user: { username : u, email: e, password: p } }),
        },
        profiles: {
            get: (user : string) => send<ProfileResponse>('GET', `/profiles/${user}`)
        },
        follow: {
            post: (user : string) => send<ProfileResponse>('POST', `/profiles/${user}/follow`),
            del : (user : string) => send<ProfileResponse>('DELETE', `/profiles/${user}/follow`),
        },
        articles: {
            get : (q = {} as ArticlesQuery) => send<ArticlesResponse>('GET', '/articles' + query(q)),
            post: (article: NewArticle) => send<ArticleResponse>('POST', '/articles', { article })
        },
        article: {
            get : (slug : string) => send<ArticleResponse>('GET', `/articles/${slug}`),
            put : (article : Article) => send<ArticleResponse>('PUT', `/articles/${article.slug}`, { article }),
            del : (slug : string) => send<{}>('DELETE', `/articles/${slug}`),
        },
        comments: {
            get : (slug : string) => send<CommentsResponse>('GET', `/articles/${slug}/comments`),
            post : (slug : string, body : string) => send<CommentResponse>('POST', `/articles/${slug}/comments`, { comment: { body} })
        },
        comment: {
            del : (slug : string, id : number) => send<void>('DELETE', `/articles/${slug}/comments/${id}`)
        },
        feed: {
            get : (q = {} as ArticlesQuery) => send<ArticlesResponse>('GET', '/articles/feed' + query(q))
        },
        tags: {
            get : () => send<Tags>('GET', '/tags'),
        },
        favorite: {
            post: (slug : string) => send<ArticleResponse>('POST', `/articles/${slug}/favorite`),
            del : (slug : string) => send<ArticleResponse>('DELETE', `/articles/${slug}/favorite`),
        }
    };

    // base send utility, defines out conventions for talking to server:
    // what our auth header is, non-success throws, etc.
    async function send<T>(method : string, url : string, data? : any) : Promise<T> {
        const 
            headers = {} as { [ key: string] : string },
            opts = { method, headers } as RequestInit;

        if (data !== undefined) {
            headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(data);
        }

        if (token()) {
            headers['Authorization'] = `Token ${token()}`;
        }

        const response = await fetch(server + url, opts);

        // unlike native fetch(), throw on non-success
        if (response.status !== 200) throw response;

        return response.json();
    }
},
/**
 * Does the given rejection value represent an authentication failure?
 * 
 * Used to determine whether to attempt to (re)login and re-try request.
 */
isAuthFailure = (e : any) => e instanceof Response && e.status === 401,
/**
 * Utility to convert an object of key-values into a query string
 */
query = (q : { [ prop : string ] : any }) =>
    Object.keys(q)
        .filter(p => q[p] !== undefined)
        // weird, the Conduit server doesn't expect these params to be escaped and fails on them if so :/
        //.map((p, i) => `${i ? '&' : '?'}${encodeURIComponent(p)}=${encodeURIComponent(q[p]!)}`)
        .map((p, i) => `${i ? '&' : '?'}${p}=${q[p]}`)
        .join('');