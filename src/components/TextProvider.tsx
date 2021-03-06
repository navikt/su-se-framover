import * as React from 'react';
import { IntlProvider, MessageFormatElement } from 'react-intl';

export enum Languages {
    nb = 'nb-NO',
}

const TextProvider = <T extends Record<string, string> | Record<string, MessageFormatElement[]>>(props: {
    messages: { [key in Languages]: T };
    children: React.ReactNode | React.ReactNode[];
}) => {
    return (
        <IntlProvider locale="nb-NO" messages={props.messages[Languages.nb]}>
            {props.children}
        </IntlProvider>
    );
};

export default TextProvider;
