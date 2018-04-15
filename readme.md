# ![RealWorld Example App](logo.png)

> ### Surplus codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.


### [Demo](https://github.com/gothinkster/realworld)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)


This codebase demonstrates a fully fledged application built with Surplus, including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the Surplus community styleguides & best practices.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.


# How it works

## General Overview

This implementation uses [S.js](https://github.com/adamhaile/S) for state handling and [Surplus](https://github.com/adamhaile/surplus) JSX to render web views from that state.

If you're not familiar with S, you can think of it as being like "spreadsheet programming": you change data, and the system automatically updates downstream computations.  The cost of this automation is that the data being changed must be wrapped in `S.data()` and the computations being updated must be wrapped in `S(() => ... )`.

The implementation also uses Typescript.  S and Surplus are written in Typescript and have first-class Typescript support, but Typescript is in no way a requirement for using S or Surplus.

The primary build tool is webpack.  Configuration is very minimal.  See [webpack.config.js](webpack.config.js) and [tsconfig.json](tsconfig.json).

## Code Architecture

There are two main source folders, `src/app/` and `src/components/`.  The `app/` folder contains code for the state and services which are available to the entire application: who the current user is, where we are in the app, our client for talking to the server, etc.  You can think of it as the "back half" of the program.

`components/` defines the application's views, their state, and the actions you can take from them.  You can think of it as the "front half" of the program.

The entry point to the application is [src/main.tsx](./src/main.tsx).  It constructs the `app` object and then the router with the routing table.  It contains the app's only call to `S.root()`.  All the other computations which make the app reactive are created by routes, and are automatically disposed when the route changes.

## Routing 

A route in the routing table looks like:

```js
    [ /^#\/article\/(.*)/, ([, slug ]) => ArticleRoute(app, slug) ]
```

That consists of:
- a regex to match the location
- a function that is run if the regex matches.  It receives the regex match object and uses destructuring to pull params out it, here `slug`.
- the main routing function.

The routing functions and top-level pages have a generally consistent structure.  Here's an abridged version of Article.tsx:

```jsx
type ArticleModel = ReturnType<typeof ArticleModel>;
const 
    ArticleRoute = async (app : App, slug : string) => {
        const commentsReq = app.client.comments.get(slug),
            { article } = await app.client.article.get(slug),
            model = ArticleModel(app, article, commentsReq, () => app.location.change('#'));
        return () => <ArticlePage {...model} />;
    },
    ArticleModel = (app : App, article : Article, commentsReq : Promise<CommentsResponse>, onDelete: () => void) => {
        ... route state and actions
        return { app, ...any route state and actions exposed to views };
    },
    ArticlePage = (model : ArticleModel) => (
        <Page app={model.app} title={`${model.article().title} - Conduit`} section={MenuSection.None}>
            <Article {...model}/>
        </Page>
    ),
    Article = (props : ArticleModel) => (
        ...JSX defining main article view
    );
```

The ...Route function is our entry point from the router.  It's async so that it can perform any requests we wish to complete before the page view can load. Here, we decide to wait until we've fetched the article from the server, but not to wait on the comments (the view displays a 'Loading...' indicator for them if they aren't yet available).  It then constructs the ...Model and passes back a constructor function for the view.  Actual construction of the view is performed by the router, so that all the computations that make the view reactive will be disposed when the route changes (see ./app/asyncRouter).  Since this function is our interface with the router, it also handles creating any callbacks that change our location in the app, like `onDelete` here.

The ...Model is an in-code definition of the page: what data and state is visible in it and what actions can be performed from it.  Data signals to handle page-specific state -- what tab are we on, values in entry forms, etc -- are defined here.  So to are functions for any actions that can be taken -- posting a comment, deleting the article, etc.

The ...Page function is pretty simple: it just wraps the main content in the standard Page component, specifying in the process what page title to use and which navigation tab to display as selected.

Finally, the main view function defines the primary content view for the page.  In most components, it will in turn call several smaller view functions, as well as components used across the app, like the Favorite button.

## Authentication

Authentication is tricky in a web app, because only the server truly knows whether we're logged in.  Even if the user has already authenticated once, our token may expire, or go stale from a period of inactivity, or the server may be rebooted, etc. 

Even worse, any request to the server could be the one that finds out we're no longer authenticated.  This means that any code issuing a request needs to be able to deal with an auth failure.

For these reasons, many of the realworld demos have issues with authentication.  If you are not authenticated but follow a link to a page that requires authentication -- from an email, or wherever -- many apps experience internal errors, or bounce you to the homepage, or send you to the login page only to afterwards send you to the homepage not the page you initially requested.

This app uses a 'monitoring' strategy to handle authentication correctly and orthogonally without requiring each piece of code making a request to handle auth failures.  We first construct our base client for talking to the server, which contains all the information about what the endpoints are, what their message formats are, etc.  We then create a proxy for this client.  The proxy calls through to the main client's methods to issue requests, but as it does so, it watches the response to see if an authentication failure is returned.  If it is, then it tells the app to request credentials from the user, re-authenticates, and re-issues the initial failed request.

With this strategy, authentication works seamlessly, for the user and for code issuing requests.  If an unauthenticated user follows a link to an authenticated page, we detect the failed request, require the user to log in, then re-issue the now successful request and send them on to the page they expected.

# Getting started

To run locally during development:

- `npm install` to install all dependencies
- `npm start` to build and serve app locally using webpack-dev-server
- browse to http://localhost:8080/

To create a production build:

- `npm run build` creates a development build, with all source compiled into ./dist/main.js


