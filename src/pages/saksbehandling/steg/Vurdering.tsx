import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import React from 'react';

import { useI18n } from '~lib/hooks';

import sharedI18n from './sharedI18n-nb';
import styles from './vurdering.module.less';

export const Vurderingknapper = (props: {
    onTilbakeClick(): void;
    onNesteClick?(): void;
    onLagreOgFortsettSenereClick(): void;
    nesteKnappTekst?: string;
}) => {
    const intl = useI18n({ messages: { ...sharedI18n } });

    return (
        <div className={styles.buttonContainer}>
            <div className={styles.navigationButtonContainer}>
                <Knapp onClick={props.onTilbakeClick} htmlType="button">
                    {intl.formatMessage({ id: 'knapp.tilbake' })}
                </Knapp>
                <Hovedknapp onClick={props.onNesteClick} htmlType={props.onNesteClick ? 'button' : 'submit'}>
                    {props.nesteKnappTekst ? props.nesteKnappTekst : intl.formatMessage({ id: 'knapp.neste' })}
                </Hovedknapp>
            </div>
            <Knapp onClick={props.onLagreOgFortsettSenereClick} htmlType="button">
                {intl.formatMessage({ id: 'knapp.lagreOgfortsettSenere' })}
            </Knapp>
        </div>
    );
};
