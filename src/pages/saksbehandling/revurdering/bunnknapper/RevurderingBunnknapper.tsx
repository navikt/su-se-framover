import { Button } from '@navikt/ds-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useI18n } from '~src/lib/i18n';

import NullstillRevurderingVarsel from '../advarselReset/NullstillRevurderingVarsel';

import messages from './revurderingbunnknapper-nb';
import * as styles from './revurderingBunnknapper.module.less';

export const RevurderingBunnknapper = ({
    onLagreOgFortsettSenereClick,
    ...props
}: {
    tilbake: { url: string; visModal: boolean } | { onTilbakeClick: () => void };
    loading?: boolean;
    onLagreOgFortsettSenereClick?: () => void;
    nesteKnappTekst?: string;
}) => {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const { formatMessage } = useI18n({ messages });
    const [knappTrykket, setKnappTrykket] = useState<'neste' | 'avslutt' | undefined>(undefined);

    const Tilbake = () => {
        const { tilbake } = props;
        if (tilbake === undefined) return <></>;
        const tilbakeknapp = (onClick: () => void) => (
            <Button onClick={onClick} variant="secondary" type="button">
                {formatMessage('knapp.tilbake')}
            </Button>
        );
        if ('url' in tilbake) {
            return tilbake.visModal ? (
                <>
                    {tilbakeknapp(() => setModalOpen(true))}
                    <NullstillRevurderingVarsel
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        tilbakeUrl={tilbake.url}
                    />
                </>
            ) : (
                tilbakeknapp(() => navigate(tilbake.url))
            );
        }
        return tilbakeknapp(tilbake.onTilbakeClick);
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
                <Button onClick={() => setKnappTrykket('neste')} loading={knappTrykket === 'neste' && props.loading}>
                    {props.nesteKnappTekst ? props.nesteKnappTekst : formatMessage('knapp.neste')}
                </Button>
            </div>
            <div className={styles.navigationButtonContainer}>{onLagreOgFortsettSenereClick && <Tilbake />}</div>
        </div>
    );
};
