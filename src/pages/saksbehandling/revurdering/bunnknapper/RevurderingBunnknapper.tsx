import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { Link } from 'react-router-dom';

import { useI18n } from '~lib/hooks';

import sharedI18n from '../../../saksbehandling/steg/sharedI18n-nb';

import styles from './revurderingBunnknapper.module.less';

export const RevurderingBunnknapper = (props: {
    tilbakeUrl: string;
    onNesteClick: 'submit' | (() => void);
    onNesteClickSpinner?: boolean;
    onLagreOgFortsettSenereClick?(): void;
    onLagreOgFortsettSenereClickSpinner?: boolean;
    nesteKnappTekst?: string;
}) => {
    const { intl } = useI18n({ messages: { ...sharedI18n } });

    return (
        <div>
            <div className={styles.navigationButtonContainer}>
                <Link to={props.tilbakeUrl} className="knapp">
                    {intl.formatMessage({ id: 'knapp.tilbake' })}
                </Link>
                <Hovedknapp
                    spinner={props.onNesteClickSpinner}
                    onClick={props.onNesteClick === 'submit' ? undefined : props.onNesteClick}
                    htmlType={props.onNesteClick === 'submit' ? 'submit' : 'button'}
                >
                    {props.nesteKnappTekst ? props.nesteKnappTekst : intl.formatMessage({ id: 'knapp.neste' })}
                </Hovedknapp>
            </div>
            {props.onLagreOgFortsettSenereClick && (
                <Knapp
                    spinner={props.onLagreOgFortsettSenereClickSpinner}
                    onClick={props.onLagreOgFortsettSenereClick}
                    htmlType="button"
                >
                    {intl.formatMessage({ id: 'knapp.lagreOgfortsettSenere' })}
                </Knapp>
            )}
        </div>
    );
};
