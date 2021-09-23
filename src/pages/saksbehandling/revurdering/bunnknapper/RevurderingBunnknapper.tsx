import { Button, Loader } from '@navikt/ds-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { useI18n } from '~lib/i18n';

import sharedI18n from '../../søknadsbehandling/sharedI18n-nb';

import styles from './revurderingBunnknapper.module.less';

export const RevurderingBunnknapper = (props: {
    tilbakeUrl?: string;
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
                {props.tilbakeUrl && (
                    <Link to={props.tilbakeUrl} className="knapp">
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </Link>
                )}
                <Button
                    onClick={props.onNesteClick === 'submit' ? undefined : props.onNesteClick}
                    type={props.onNesteClick === 'submit' ? 'submit' : 'button'}
                >
                    {props.nesteKnappTekst ? props.nesteKnappTekst : intl.formatMessage({ id: 'knapp.neste' })}
                    {props.onNesteClickSpinner && <Loader />}
                </Button>
            </div>
            {props.onLagreOgFortsettSenereClick && (
                <Button variant="secondary" onClick={props.onLagreOgFortsettSenereClick} type="button">
                    {intl.formatMessage({ id: 'knapp.lagreOgfortsettSenere' })}
                    {props.onLagreOgFortsettSenereClickSpinner && <Loader />}
                </Button>
            )}
        </div>
    );
};
