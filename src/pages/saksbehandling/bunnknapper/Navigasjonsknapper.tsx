import { Button } from '@navikt/ds-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useI18n } from '~src/lib/i18n';

import messages from './navigasjonsknapper-nb';
import * as styles from './navigasjonsknapper.module.less';

export const Navigasjonsknapper = ({
    onLagreOgFortsettSenereClick,
    ...props
}: {
    tilbake: { url: string } | { onTilbakeClick: () => void };
    loading?: boolean;
    onLagreOgFortsettSenereClick?: () => void;
    nesteKnappTekst?: string;
    onNesteClick?: () => void;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [knappTrykket, setKnappTrykket] = useState<'neste' | 'avslutt' | undefined>(undefined);

    const Tilbake = () => {
        const { tilbake } = props;
        const tilbakeknapp = (onClick: () => void) => (
            <Button onClick={onClick} variant="secondary" type="button">
                {formatMessage('knapp.tilbake')}
            </Button>
        );
        return tilbakeknapp(() => ('url' in tilbake ? navigate(tilbake.url) : tilbake.onTilbakeClick()));
    };

    return (
        <div>
            <div className={styles.navigationButtonContainer}>
                {onLagreOgFortsettSenereClick ? (
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setKnappTrykket('avslutt');
                            onLagreOgFortsettSenereClick();
                        }}
                        type="button"
                        loading={knappTrykket === 'avslutt' && props.loading}
                    >
                        {formatMessage('knapp.lagreOgfortsettSenere')}
                    </Button>
                ) : (
                    <Tilbake />
                )}
                <Button
                    onClick={() => {
                        setKnappTrykket('neste');
                        props.onNesteClick?.();
                    }}
                    type={props.onNesteClick ? 'button' : 'submit'}
                    loading={knappTrykket === 'neste' && props.loading}
                >
                    {props.nesteKnappTekst ? props.nesteKnappTekst : formatMessage('knapp.neste')}
                </Button>
            </div>
            <div className={styles.navigationButtonContainer}>{onLagreOgFortsettSenereClick && <Tilbake />}</div>
        </div>
    );
};
