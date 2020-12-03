import { IntlShape } from 'react-intl';

export function formatCurrency(
    intl: IntlShape,
    amount: number,
    options?: {
        currency?: string;
        numDecimals?: number;
    }
) {
    const mergedOptions = {
        currency: 'NOK',
        numDecimals: 2,
        ...options,
    };
    return (
        intl.formatNumber(amount, {
            currency: mergedOptions.currency,
            maximumFractionDigits: mergedOptions.numDecimals,
            minimumFractionDigits: mergedOptions.numDecimals,
        }) + ' kr'
    );
}
