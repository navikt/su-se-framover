import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Panel } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { hentSisteFerdigbehandledeKravgrunnlag } from '~src/api/tilbakekrevingApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { opprettNyTilbakekrevingsbehandling } from '~src/features/TilbakekrevingActions';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { Kravgrunnlag } from '~src/types/Kravgrunnlag';

import { TilbakekrevingSteg } from '../../types';

import messages from './OpprettTilbakekreving-nb';
import styles from './OpprettTilbakekreving.module.less';

const OpprettTilbakekreving = () => {
    const { formatMessage } = useI18n({ messages });
    const { sak } = useOutletContext<SaksoversiktContext>();
    const [status, hentKravgrunnlag] = useApiCall(hentSisteFerdigbehandledeKravgrunnlag);

    useEffect(() => {
        hentKravgrunnlag({ sakId: sak.id });
    }, []);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.tilbakekrevingHeading} size="large">
                    {formatMessage('page.heading')}
                </Heading>
            </div>

            <div className={styles.mainContentContainer}>
                {RemoteData.isSuccess(status) && (
                    <KanTilbakekreves sakId={sak.id} saksversjon={sak.versjon} kravgrunnlag={status.value} />
                )}
                {RemoteData.isFailure(status) && <KanIkkeTilbakekreves sakId={sak.id} />}
            </div>
        </div>
    );
};

const KanTilbakekreves = (props: { sakId: string; saksversjon: number; kravgrunnlag: Kravgrunnlag }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [opprettStatus, opprett] = useAsyncActionCreator(opprettNyTilbakekrevingsbehandling);

    return (
        <>
            <Panel className={styles.panelContentContainer}>
                <div>
                    <Heading size="medium">{formatMessage('tilbakekreving.kanTilbakekreves.heading')}</Heading>
                    <Heading size="small">{formatMessage('tilbakekreving.kanTilbakekreves.text')}</Heading>
                </div>

                <div className={styles.knappContainer}>
                    <LinkAsButton
                        variant="secondary"
                        href={routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                    >
                        {formatMessage('knapp.tilbake')}
                    </LinkAsButton>
                    <Button
                        loading={RemoteData.isPending(opprettStatus)}
                        onClick={() =>
                            opprett({ sakId: props.sakId, saksversjon: props.saksversjon }, (res) => {
                                navigate(
                                    routes.tilbakekrevingValgtBehandling.createURL({
                                        sakId: props.sakId,
                                        behandlingId: res.id,
                                        steg: TilbakekrevingSteg.Vurdering,
                                    }),
                                );
                            })
                        }
                    >
                        {formatMessage('tilbakekreving.kanTilbakekreves.ny')}
                    </Button>
                </div>
            </Panel>
            <OppsummeringAvKravgrunnlag kravgrunnlag={props.kravgrunnlag} />
        </>
    );
};

const KanIkkeTilbakekreves = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Panel border className={styles.panelContentContainer}>
            <div>
                <Heading size="medium">{formatMessage('tilbakekreving.kanIkkeTilbakekreves.heading')}</Heading>
                <Heading size="small">{formatMessage('tilbakekreving.kanIkkeTilbakekreves.text')}</Heading>
            </div>

            <LinkAsButton variant="secondary" href={routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                {formatMessage('knapp.tilbake')}
            </LinkAsButton>
        </Panel>
    );
};

export default OpprettTilbakekreving;
