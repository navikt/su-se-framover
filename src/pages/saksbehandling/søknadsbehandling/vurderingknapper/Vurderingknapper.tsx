import { Button } from '@navikt/ds-react';
import React, { useState } from 'react';

import { useI18n } from '~src/lib/i18n';

import messages from './vurderingknapper-nb';
import * as styles from './vurderingknapper.module.less';

export const Vurderingknapper = (props: {
    onTilbakeClick(): void;
    onNesteClick?(): void;
    onLagreOgFortsettSenereClick(): void;
    nesteKnappTekst?: string;
    loading?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [knappTrykket, setKnappTrykket] = useState<'neste' | 'lagreOgFortsettSenere' | undefined>(undefined);

    return (
        <div className={styles.buttonContainer}>
            <Button
                variant="secondary"
                onClick={() => {
                    setKnappTrykket('lagreOgFortsettSenere');
                    props.onLagreOgFortsettSenereClick();
                }}
                type="button"
                loading={knappTrykket === 'lagreOgFortsettSenere' && props.loading}
            >
                {formatMessage('knapp.lagreOgfortsettSenere')}
            </Button>
            <Button
                onClick={() => {
                    setKnappTrykket('neste');
                    props.onNesteClick && props.onNesteClick();
                }}
                type={props.onNesteClick ? 'button' : 'submit'}
                loading={knappTrykket === 'neste' && props.loading}
            >
                {props.nesteKnappTekst ? props.nesteKnappTekst : formatMessage('knapp.neste')}
            </Button>
            <Button variant="secondary" onClick={props.onTilbakeClick} type="button">
                {formatMessage('knapp.tilbake')}
            </Button>
        </div>
    );
};
