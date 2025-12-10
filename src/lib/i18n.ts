import { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';
import { ReactNode, useCallback, useMemo } from 'react';
import { createIntl, createIntlCache, IntlShape } from 'react-intl';

export enum Languages {
    nb = 'nb',
}

export class DateFormats {
    static readonly DAY_MONTH_YEAR = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };
    static readonly MONTH_YEAR = { month: '2-digit', year: 'numeric' };
}

export interface UseI18N<T extends Record<string, string> | void> {
    intl: IntlShape;
    formatMessage(id: keyof T, values?: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>): string;
    formatMessage<X = ReactNode>(
        id: keyof T,
        values?: Record<string, PrimitiveType | FormatXMLElementFn<string, X>>,
    ): X;
    formatDate(date: string | Date, dateFormat?: DateFormats): string;
}

export type MessageFormatter<T extends Record<string, string>> = UseI18N<T>['formatMessage'];

export const useI18n = <T extends Record<string, string>>(args: { messages: T }): UseI18N<T> => {
    const intl = useMemo(() => {
        const cache = createIntlCache();
        return createIntl({ locale: 'nb-NO', messages: args.messages }, cache);
    }, [args.messages]);

    const formatMessage = useCallback<UseI18N<T>['formatMessage']>(
        (id: keyof T, values: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>): string =>
            intl.formatMessage({ id: id as string }, values),
        [intl],
    );

    const formatDate = useCallback(
        (date: string | Date, dateFormat: DateFormats) => {
            return intl.formatDate(date, dateFormat);
        },
        [intl],
    );

    return { intl, formatMessage, formatDate };
};
