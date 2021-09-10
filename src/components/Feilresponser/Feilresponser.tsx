import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import React from 'react';

import { ApiError } from '~api/apiClient';
import { useI18n } from '~lib/i18n';

import messages from './feilresponser-nb';
import styles from './feilresponser.module.less';
import { feilresponseTilFeilmelding } from './FeilresponserUtils';
import revurderingsMessages from './revurderingFeilresponser/RevurderingFeilresponser-nb';
import søknadsbehandlingMessages from './søknadsbehandlingFeilresponser/søknadsbehandlingFeilresponser-nb';

const Feilresponser = (props: { error?: ApiError }) => {
    const { formatMessage } = useI18n({
        messages: { ...messages, ...revurderingsMessages, ...søknadsbehandlingMessages },
    });

    const error = feilresponseTilFeilmelding(formatMessage, props.error?.body);

    return <AlertStripeFeil className={styles.alertstripe}>{error}</AlertStripeFeil>;
};

export default Feilresponser;
