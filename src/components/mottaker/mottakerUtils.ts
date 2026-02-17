import { ApiError } from '~src/api/apiClient';

export type MottakerAlertVariant = 'warning' | 'error';

export interface MottakerAlert {
    text: string;
    variant: MottakerAlertVariant;
}

export const toMottakerAlert = (error: ApiError, fallback: string): MottakerAlert => {
    const text = error.body?.message?.trim() || fallback;
    if (error.statusCode === 400 || error.statusCode === 409 || error.statusCode === 422) {
        return { text, variant: 'warning' };
    }

    return { text, variant: 'error' };
};
