import Cookies from 'js-cookie';
import * as jwt from 'jsonwebtoken';

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

export function remove(name: CookieName) {
    Cookies.remove(name, defaultCookieOptions);
}

export const getNameFromAccessToken = (): string | null => {
    const token = Cookies.get(CookieName.AccessToken);
    if (!token) {
        return null;
    }
    const decodedToken = jwt.decode(token);
    if (!decodedToken || typeof decodedToken === 'string') {
        return null;
    }
    if ('name' in decodedToken) {
        return decodedToken.name;
    }
    return null;
};
