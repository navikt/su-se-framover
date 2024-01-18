import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Panel } from '@navikt/ds-react';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import { opprettNyTilbakekrevingsbehandling } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { Kravgrunnlag } from '~src/types/Kravgrunnlag';
import { TilbakekrevingSteg } from '~src/types/ManuellTilbakekrevingsbehandling';

import messages from '../Tilbakekreving-nb';

import * as styles from './OpprettTilbakekreving.module.less';

const OpprettTilbakekreving = (props: {
    sakId: string;
    sakVersjon: number;
    uteståendeKravgrunnlag: Nullable<Kravgrunnlag>;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.tilbakekrevingHeading} size="large">
                    {formatMessage('tilbakekreving.tittel')}
                </Heading>
            </div>

            <div className={styles.mainContentContainer}>
                {props.uteståendeKravgrunnlag ? (
                    <KanTilbakekreves
                        sakId={props.sakId}
                        saksversjon={props.sakVersjon}
                        kravgrunnlag={props.uteståendeKravgrunnlag}
                    />
                ) : (
                    <KanIkkeTilbakekreves sakId={props.sakId} />
                )}
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
                    <Heading size="medium">{formatMessage('opprettelse.kanTilbakekreves.heading')}</Heading>
                    <Heading size="small">{formatMessage('opprettelse.kanTilbakekreves.text')}</Heading>
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
                            opprett({ sakId: props.sakId, versjon: props.saksversjon }, (res) => {
                                navigate(
                                    routes.tilbakekrevingValgtBehandling.createURL({
                                        sakId: props.sakId,
                                        behandlingId: res.id,
                                        steg: TilbakekrevingSteg.Forhåndsvarsling,
                                    }),
                                );
                            })
                        }
                    >
                        {formatMessage('opprettelse.kanTilbakekreves.ny')}
                    </Button>
                </div>
                {RemoteData.isFailure(opprettStatus) && <ApiErrorAlert error={opprettStatus.error} />}
            </Panel>
            <OppsummeringAvKravgrunnlag kravgrunnlag={props.kravgrunnlag} medPanel={{}} />
        </>
    );
};

const KanIkkeTilbakekreves = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Panel border className={styles.panelContentContainer}>
            <div>
                <Heading size="medium">{formatMessage('opprettelse.kanIkkeTilbakekreves.heading')}</Heading>
                <Heading size="small">{formatMessage('opprettelse.kanIkkeTilbakekreves.text')}</Heading>
            </div>

            <LinkAsButton variant="secondary" href={routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                {formatMessage('knapp.tilbake')}
            </LinkAsButton>
        </Panel>
    );
};

export default OpprettTilbakekreving;
