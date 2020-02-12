import { useGet } from './useGet';

export const useAuthRedirect = ({ url, loginUrl }) => {
    const data = useGet({ url });
    if (data.status === 401) {
        window.location.href = loginUrl;
    } else if (data.status === 403) {
        return { data: { data: 'Bruker har ikke tilgang.' } };
    }
    return data;
};
