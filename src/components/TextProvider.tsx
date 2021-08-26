import * as React from 'react';
import { IntlProvider, MessageFormatElement } from 'react-intl';

import { Languages } from '~lib/i18n';

const TextProvider = <T extends Record<string, string> | Record<string, MessageFormatElement[]>>(props: {
    messages: { [key in Languages]: T };
    children: React.ReactNode | React.ReactNode[];
}) => {
    return (
        <IntlProvider locale={Languages.nb} messages={props.messages[Languages.nb]}>
            {props.children}
        </IntlProvider>
    );
};

export default TextProvider;
