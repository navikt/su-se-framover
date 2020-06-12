import Cookies from 'js-cookie';

export enum CookieName {
    AccessToken = 'access_token',
    RefreshToken = 'refresh_token'
}

export function get()
