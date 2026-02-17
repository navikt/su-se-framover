import { ApiError } from '~src/api/apiClient';

export type MottakerAlertVariant = 'warning' | 'error';

export interface MottakerAlert {
    text: string;
    variant: MottakerAlertVariant;
}

export const toMottakerAlert = (error: ApiError, fallback: string): MottakerAlert => {
    const message = error.body?.message;
    const text = message ? message.trim() || fallback : fallback;
    if (error.statusCode === 400) {
        return { text, variant: 'warning' };
    }

    return { text, variant: 'error' };
};
