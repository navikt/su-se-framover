export interface UmamiConfig {
    scriptUrl: string;
    hostUrl: string;
    websiteId: string;
}

export interface FrontendConfig {
    environment: string;
    umami?: UmamiConfig;
}
