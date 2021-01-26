import Cookies from 'js-cookie';

export enum CookieName {
    LoginRedirectUrl = 'login_redirect_url',
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

export function remove(name: CookieName) {
    Cookies.remove(name, defaultCookieOptions);
}

export function take(name: CookieName) {
    const val = get(name);
    if (val) {
        remove(name);
    }
    return val;
}
