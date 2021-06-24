import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';

import { erGregulering } from '~features/revurdering/revurderingUtils';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/hooks';
import { OpprettetRevurderingGrunn } from '~types/Revurdering';

import styles from './revurdering.module.less';

const RevurderingIngenEndringAlert = (props: { årsak: OpprettetRevurderingGrunn; className?: string }) => {
    const intl = useI18n({ messages: sharedMessages });

    if (erGregulering(props.årsak)) {
        return (
            <AlertStripeInfo className={props.className}>
                <Undertittel className={styles.undertittelContainer}>
                    {intl.formatMessage({ id: 'revurdering.ingenEndring.gregulering.tittel' })}
                </Undertittel>
                <p>{intl.formatMessage({ id: 'revurdering.ingenEndring.gregulering.beskrivelse' })}</p>
            </AlertStripeInfo>
        );
    }

    return (
        <AlertStripeInfo className={props.className}>
            <Undertittel className={styles.undertittelContainer}>
                {intl.formatMessage({ id: 'revurdering.ingenEndring.tittel' })}
            </Undertittel>
            <p>{intl.formatMessage({ id: 'revurdering.ingenEndring' })}</p>
        </AlertStripeInfo>
    );
};

export default RevurderingIngenEndringAlert;
