import { PrimitiveType, FormatXMLElementFn } from 'intl-messageformat';
import * as React from 'react';
import { createIntlCache, createIntl, IntlShape } from 'react-intl';

export enum Languages {
    nb = 'nb',
}

export interface UseI18N<T extends Record<string, string>> {
    intl: IntlShape;
    formatMessage(id: keyof T, values?: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>): string;
    formatMessage<X = React.ReactNode>(
        id: keyof T,
        values?: Record<string, PrimitiveType | FormatXMLElementFn<string, X>>
    ): X;
}

export type MessageFormatter<T extends Record<string, string>> = UseI18N<T>['formatMessage'];

export const useI18n = <T extends Record<string, string>>(args: { messages: T }): UseI18N<T> => {
    const intl = React.useMemo(() => {
        const cache = createIntlCache();
        return createIntl({ locale: 'nb-NO', messages: args.messages }, cache);
    }, [args.messages]);

    const formatMessage = React.useCallback<UseI18N<T>['formatMessage']>(
        <Y>(id: keyof T, values: Record<string, PrimitiveType | FormatXMLElementFn<string, Y>>): Y =>
            intl.formatMessage({ id: id as string }, values) as Y,
        [intl]
    );

    return { intl, formatMessage };
};
