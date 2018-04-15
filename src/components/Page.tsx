import S from 's-js';
import * as Surplus from "surplus";
import { App } from "../app/app";
import { User } from "../app/client";

export { Page, MenuSection }

const enum MenuSection {
    Home,
    NewPost,
    Settings,
    Profile,
    SignIn,
    SignUp,
    None
}

const 
    /**
     * Page element, for wrapping content and displaying the standard conduit page with header and footer
     */
    Page = ({ app, section, title, children } : { app: App, section: MenuSection, title: string | (() => string), children : JSX.Element}) => {
        PageTitle(title);
        return (
            <div className="page">
                <Header section={section} app={app} />
                {children}
                <Footer />
            </div>
        );
    },
    /**
     * Set the page's title to the given string, and restore it when done
     */
    PageTitle = (title : string | (() => string)) => {
        const el = document.head.querySelector('title')!,
            prevTitle = el.textContent;
        return S(() => {
            const _title = typeof title === 'function' ? title() : title;
            if (!_title) return;
            el.textContent = _title;
            S.cleanup(() => el.textContent = prevTitle);
        });
    },
    Header = ({ section, app: { user, isAuthenticated } } : { section: MenuSection, app : App }) => (
        <nav class="navbar navbar-light">
            <div class="container">
                <a class="navbar-brand" href="#">
                    conduit
                </a>
                <ul class="nav navbar-nav pull-xs-right">
                    <SectionLink href="#" active={section === MenuSection.Home}>Home</SectionLink>
                    { isAuthenticated() ? [
                        <SectionLink href="#/editor" active={section === MenuSection.NewPost}>
                            <i class="ion-compose" />&nbsp;New Article
                        </SectionLink>,
                        <SectionLink href="#/settings" active={section === MenuSection.Settings}>
                            <i class="ion-gear-a" />&nbsp;Settings
                        </SectionLink>,
                        user() && 
                        <SectionLink href={`#/@${user()!.username}`} active={section === MenuSection.Profile}>
                            {user()!.image && <img class="user-pic" src={user()!.image} />}
                            {user()!.username}
                        </SectionLink>
                    ] : [
                        <SectionLink href="#/login" active={section === MenuSection.SignIn}>Sign in</SectionLink>,
                        <SectionLink href="#/register" active={section === MenuSection.SignUp}>Sign up</SectionLink>
                    ]}
                </ul>
            </div>
        </nav>
    ),
    SectionLink = ({ active, href, children } : { active : boolean, href : string, children: JSX.Children }) => (
        <li class="nav-item">
            <a class={"nav-link " + (active ? "active" : "")} href={href}>
                {children}
            </a>
        </li>
    ),
    Footer = () => (
        <footer>
            <div class="container">
                <a href="/" class="logo-font">
                    conduit
                </a>
                <span class="attribution">
                    An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design
                    licensed under MIT.
                </span>
            </div>
        </footer>
    );
