import { FrontendConfig } from '../server/config';

// console.log(document.getElementById('FRONTEND_CONFIG')?.innerHTML ?? '{}');
// const config = JSON.parse(document.getElementById('FRONTEND_CONFIG')?.innerHTML ?? '{}') as FrontendConfig;

//TODO jah: Virker ikke som posthtml fungerer så godt med Parcel 2 enda. Må man virkelig bruke posthtml for å få til dette?
const config = {
    LOGIN_URL: '/login',
    LOGOUT_URL: '/logout',
    AMPLITUDE_API_KEY: 'x',
} as FrontendConfig;
export default config;
