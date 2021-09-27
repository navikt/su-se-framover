import { Button } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~lib/i18n';

import sharedI18n from './sharedI18n-nb';
import styles from './vurdering.module.less';

export const Vurderingknapper = (props: {
    onTilbakeClick(): void;
    onNesteClick?(): void;
    onLagreOgFortsettSenereClick(): void;
    nesteKnappTekst?: string;
}) => {
    const { intl } = useI18n({ messages: { ...sharedI18n } });

    return (
        <div className={styles.buttonContainer}>
            <div className={styles.navigationButtonContainer}>
                <Button variant="secondary" onClick={props.onTilbakeClick} type="button">
                    {intl.formatMessage({ id: 'knapp.tilbake' })}
                </Button>
                <Button onClick={props.onNesteClick} type={props.onNesteClick ? 'button' : 'submit'}>
                    {props.nesteKnappTekst ? props.nesteKnappTekst : intl.formatMessage({ id: 'knapp.neste' })}
                </Button>
            </div>
            <Button variant="secondary" onClick={props.onLagreOgFortsettSenereClick} type="button">
                {intl.formatMessage({ id: 'knapp.lagreOgfortsettSenere' })}
            </Button>
        </div>
    );
};
