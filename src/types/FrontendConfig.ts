export interface UmamiConfig {
    scriptUrl: string;
    websiteId: string;
}

export interface FrontendConfig {
    environment: string;
    umami?: UmamiConfig;
}
