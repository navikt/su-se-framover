import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '~src/api/apiClient';

export const useNotatFeedback = () => {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<ApiError | null>(null);
    const harFeedback = successMessage !== null || actionError !== null;

    useEffect(() => {
        if (!harFeedback) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setSuccessMessage(null);
            setActionError(null);
        }, 5000);

        return () => window.clearTimeout(timeoutId);
    }, [harFeedback]);

    return {
        successMessage,
        actionError,
        clearFeedback: useCallback(() => {
            setSuccessMessage(null);
            setActionError(null);
        }, []),
        showSuccess: useCallback((message: string) => {
            setActionError(null);
            setSuccessMessage(message);
        }, []),
        showError: useCallback((error: ApiError) => {
            setSuccessMessage(null);
            setActionError(error);
        }, []),
    };
};
