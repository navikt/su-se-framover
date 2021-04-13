import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';

import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/hooks';

import styles from './revurdering.module.less';

const RevurderingIngenEndringAlert = (props: { className?: string }) => {
    const intl = useI18n({ messages: sharedMessages });
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
