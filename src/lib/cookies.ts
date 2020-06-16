import Cookies from 'js-cookie';

export enum CookieName {
    AccessToken = 'access_token',
    RefreshToken = 'refresh_token'
}

const defaultCookieOptions: Cookies.CookieAttributes = {
    secure: true,
    domain: 'su-se.no',
    path: '/su-se',
    sameSite: 'strict'
};

export function get(name: CookieName) {
    return Cookies.get(name);
}

export function set<T extends string>(name: CookieName, value: T) {
    Cookies.set(name, value, defaultCookieOptions);
}
