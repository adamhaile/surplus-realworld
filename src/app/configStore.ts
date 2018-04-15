/**
 * Deployment-specific static app configuration data.
 * 
 * Loaded by separate .js file, appconfig.js, which stashes data onto window.APPCONFIG,
 * from which we load it here.
 */
export interface Config {
    Server : string;
}

export const ConfigStore = () => (window as any).APPCONFIG as Config;