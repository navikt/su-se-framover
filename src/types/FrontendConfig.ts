export interface UmamiConfig {
    scriptUrl: string;
    websiteId: string;
}

export interface FrontendConfig {
    environment: string;
    cachebuster: string;
    umami?: UmamiConfig;
}
