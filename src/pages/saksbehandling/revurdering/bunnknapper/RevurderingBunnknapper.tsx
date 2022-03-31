import { Button, Modal, Heading, BodyShort } from '@navikt/ds-react';
import React, { useState } from 'react';
import { matchPath, useHistory } from 'react-router-dom';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';

import sharedI18n from '../../søknadsbehandling/sharedI18n-nb';

import messages from './revurderingBunnknapper-nb';
import styles from './revurderingBunnknapper.module.less';

export const RevurderingBunnknapper = ({
    onLagreOgFortsettSenereClick,
    ...props
}: {
    tilbakeUrl?: string;
    onTilbakeClick?: () => void;
    loading?: boolean;
    onLagreOgFortsettSenereClick?: () => void;
    nesteKnappTekst?: string;
}) => {
    const history = useHistory();
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedI18n } });
    const [knappTrykket, setKnappTrykket] = useState<'neste' | 'avslutt' | undefined>(undefined);

    const Tilbake = () => {
        const navigererTilRevurderingStartside =
            typeof props.tilbakeUrl === 'string' &&
            matchPath(props.tilbakeUrl, {
                path: Routes.revurderValgtRevurdering.path.replace(':steg', 'periode'),
            }) !== null;

        const navigationCallback = () =>
            navigererTilRevurderingStartside
                ? setModalOpen(true)
                : props.tilbakeUrl
                ? history.push(props.tilbakeUrl)
                : undefined;

        return (
            <Button
                onClick={props.onTilbakeClick ? props.onTilbakeClick : navigationCallback}
                variant="secondary"
                type="button"
            >
                {formatMessage('knapp.tilbake')}
            </Button>
        );
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

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div className={styles.modalContainer}>
                    <Heading level="2" size="medium" className={styles.modalTittel}>
                        {formatMessage('modal.tittel')}
                    </Heading>
                    <div>
                        <BodyShort>{formatMessage('modal.info.p1')}</BodyShort>
                        <BodyShort>{formatMessage('modal.info.p2')}</BodyShort>
                    </div>
                    <div className={styles.modalKnappContainer}>
                        <Button variant="tertiary" type="button" onClick={() => setModalOpen(false)}>
                            {formatMessage('modal.knapp.avbryt')}
                        </Button>
                        {/* blir sjekket ved navigererTilRevurderingStartside */}
                        {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                        <LinkAsButton variant="danger" href={props.tilbakeUrl!}>
                            {formatMessage('modal.knapp.gåTilbake')}
                        </LinkAsButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
