import { useGet } from './useGet';
import { useContext } from 'react';
import { ConfigContext } from './useConfig';

export const useAuthRedirect = ({ url, loginPath }) => {
    const data = useGet({ url });

    const config = useContext(ConfigContext);
    const loginUrl = config ? config.suSeBakoverUrl + loginPath : undefined;
    if (data.status === 401) {
        window.location.href = loginUrl;
    } else if (data.status === 403) {
        return { data: { data: 'Bruker har ikke tilgang.' } };
    }
    return data;
};
