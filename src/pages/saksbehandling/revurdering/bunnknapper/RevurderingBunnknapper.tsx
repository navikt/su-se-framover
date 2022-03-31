import { Button, Loader, Modal, Heading, BodyShort } from '@navikt/ds-react';
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

    const navigererTilRevurderingStartside =
        typeof props.tilbakeUrl === 'string' &&
        matchPath(props.tilbakeUrl, {
            path: Routes.revurderValgtRevurdering.path.replace(':steg', 'periode'),
        }) !== null;

    const Tilbake = () => (
        <>
            {props.tilbakeUrl && (
                <Button
                    type="button"
                    onClick={() => {
                        /* props.tilbakeUrl blir sjekket om vi skal rendre denne button-komponenten */
                        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
                        navigererTilRevurderingStartside ? setModalOpen(true) : history.push(props.tilbakeUrl!);
                    }}
                    variant="secondary"
                >
                    {formatMessage('knapp.tilbake')}
                </Button>
            )}
            {props.onTilbakeClick && (
                <Button onClick={props.onTilbakeClick} variant="secondary">
                    {formatMessage('knapp.tilbake')}
                </Button>
            )}
        </>
    );

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
                    >
                        {formatMessage('knapp.lagreOgfortsettSenere')}
                        {knappTrykket === 'avslutt' && props.loading && <Loader />}
                    </Button>
                ) : (
                    <Tilbake />
                )}
                <Button onClick={() => setKnappTrykket('neste')} type={'submit'}>
                    {props.nesteKnappTekst ? props.nesteKnappTekst : formatMessage('knapp.neste')}
                    {knappTrykket === 'neste' && props.loading && <Loader />}
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
                        <Button variant="tertiary" onClick={() => setModalOpen(false)}>
                            {formatMessage('modal.knapp.avbryt')}
                        </Button>
                        {/* props.tilbakeUrl blir sjekket ved navigererTilRevurderingStartside. (som bestemmer om modal skal åpnes eller ikke)  */}
                        {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                        <LinkAsButton variant="danger" href={props.tilbakeUrl!}>
                            {formatMessage('modal.knapp.nullstillData')}
                        </LinkAsButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
