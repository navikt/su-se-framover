import { useGet } from './useGet';

const shouldRedirectToLogin = headers => headers && headers.has('WWW-Authenticate')

export const useAuthRedirect = ({ url, loginUrl }) => {
    const data = useGet({ url });
    if (data.status && data.status === 401) {
        if (shouldRedirectToLogin(data.headers)) {
            window.location.href = loginUrl
        } else {
            return { data: { data: "Bruker har ikke tilgang." } }
        }
    }
    return data
};
