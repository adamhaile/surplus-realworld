import { App } from "../app/app";

export const LogoutRoute = async (app : App) => {
    await app.logout();
    app.location.change('#');
    return () => null;
}