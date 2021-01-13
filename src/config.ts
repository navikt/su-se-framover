import { FrontendConfig } from '../server/config';

const config = JSON.parse(document.getElementById('FRONTEND_CONFIG')?.innerHTML ?? '{}') as FrontendConfig;

export default config;
