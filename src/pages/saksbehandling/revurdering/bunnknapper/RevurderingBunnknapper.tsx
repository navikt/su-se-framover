import { Button, Loader } from '@navikt/ds-react';
import React, { useState } from 'react';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { useI18n } from '~lib/i18n';

import sharedI18n from '../../søknadsbehandling/sharedI18n-nb';

import styles from './revurderingBunnknapper.module.less';

export const RevurderingBunnknapper = ({
    onLagreOgFortsettSenereClick,
    ...props
}: {
    tilbakeUrl?: string;
    loading?: boolean;
    onLagreOgFortsettSenereClick?: () => void;
    nesteKnappTekst?: string;
}) => {
    const { intl } = useI18n({ messages: { ...sharedI18n } });
    const [knappTrykket, setKnappTrykket] = useState<'neste' | 'avslutt' | undefined>(undefined);

    return (
        <div>
            <div className={styles.navigationButtonContainer}>
                {onLagreOgFortsettSenereClick && (
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setKnappTrykket('avslutt');
                            onLagreOgFortsettSenereClick();
                        }}
                        type="button"
                    >
                        {intl.formatMessage({ id: 'knapp.lagreOgfortsettSenere' })}
                        {knappTrykket === 'avslutt' && props.loading && <Loader />}
                    </Button>
                )}
                <Button onClick={() => setKnappTrykket('neste')} type={'submit'}>
                    {props.nesteKnappTekst ? props.nesteKnappTekst : intl.formatMessage({ id: 'knapp.neste' })}
                    {knappTrykket === 'neste' && props.loading && <Loader />}
                </Button>
            </div>
            <div className={styles.navigationButtonContainer}>
                {props.tilbakeUrl && (
                    <LinkAsButton href={props.tilbakeUrl} variant="secondary">
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </LinkAsButton>
                )}
            </div>
        </div>
    );
};
