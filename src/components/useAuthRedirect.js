import { useState } from 'react';
import { useGet } from './useGet';

export const useAuthRedirect = ({url, loginUrl}) => {
    const data = useGet({ url });
    if (data.status && data.status === 401) {
        window.location.href = loginUrl
    }
    return data
};