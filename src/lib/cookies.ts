import Cookies from 'js-cookie';

export enum CookieName {
    AccessToken = 'access_token',
    RefreshToken = 'refresh_token',
}

const defaultCookieOptions: Cookies.CookieAttributes =
    process.env.NODE_ENV !== 'development'
        ? {
              secure: true,
              domain: window.location.host,
              path: '/',
              sameSite: 'strict',
          }
        : { path: '/', sameSite: 'strict' };

export function get(name: CookieName) {
    return Cookies.get(name);
}

export function set<T extends string>(name: CookieName, value: T) {
    Cookies.set(name, value, defaultCookieOptions);
}
