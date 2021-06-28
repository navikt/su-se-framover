import { Normaltekst, Element } from 'nav-frontend-typografi';
import * as React from 'react';

import { getRevurderingsårsakMessageId } from '~features/revurdering/revurderingUtils';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/hooks';
import { Revurdering } from '~types/Revurdering';

const RevurderingÅrsakOgBegrunnelse = (props: { revurdering: Revurdering; className?: string }) => {
    const intl = useI18n({ messages: sharedMessages });
    return (
        <div className={props.className}>
            <p>
                <Element tag="span">{intl.formatMessage({ id: 'revurdering.årsak' })}: </Element>
                <Normaltekst tag="span">
                    {intl.formatMessage({ id: getRevurderingsårsakMessageId(props.revurdering.årsak) })}
                </Normaltekst>
            </p>
            <p>
                <Element tag="span">{intl.formatMessage({ id: 'revurdering.begrunnelse' })}: </Element>
                <Normaltekst tag="span">{props.revurdering.begrunnelse}</Normaltekst>
            </p>
        </div>
    );
};

export default RevurderingÅrsakOgBegrunnelse;
