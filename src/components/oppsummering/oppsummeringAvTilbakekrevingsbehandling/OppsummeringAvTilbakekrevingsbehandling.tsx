import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Label } from '@navikt/ds-react';
import React from 'react';

import { forhåndsvisVedtaksbrevTilbakekrevingsbehandling } from '~src/api/tilbakekrevingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Oppsummeringspanel, {
    Oppsummeringsikon,
    Oppsummeringsfarge,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import UnderkjenteAttesteringer from '~src/components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { TidligereSendtForhåndsvarsler } from '~src/pages/saksbehandling/tilbakekreving/behandleTilbakekreving/forhåndsvarsleTilbakekreving/ForhåndsvarsleTilbakekreving';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';
import { formatDateTime } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvTilbakekrevingsbehandling-nb';
import styles from './OppsummeringAvTilbakekrevingsbehandling.module.less';
import OppsummeringAvVurdering from './vurdering/OppsummeringAvVurdering';

const OppsummeringAvTilbakekrevingsbehandling = (props: { behandling: ManuellTilbakekrevingsbehandling }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.oppsummeringspageContainer}>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Liste}
                farge={Oppsummeringsfarge.Lilla}
                tittel={formatMessage('oppsummering.tilbakekrevingsbehandling.panel.tittel')}
                classNameChildren={styles.oppsummeringspanel}
            >
                <OppsummeringAvMetaInformasjon behandling={props.behandling} />

                <UnderkjenteAttesteringer attesteringer={props.behandling.attesteringer} />

                <OppsummeringAvVurdering vurderinger={props.behandling.vurderinger} />
            </Oppsummeringspanel>
            <OppsummeringAvBrev behandling={props.behandling} />
        </div>
    );
};

const OppsummeringAvMetaInformasjon = (props: { behandling: ManuellTilbakekrevingsbehandling }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.metaInfoContainer}>
            <OppsummeringPar
                label={formatMessage('oppsummering.tilbakekrevingsbehandling.startet')}
                verdi={formatDateTime(props.behandling.opprettet)}
                retning="vertikal"
            />
            <OppsummeringPar
                label={formatMessage('oppsummering.tilbakekrevingsbehandling.opprettetAv')}
                verdi={props.behandling.opprettetAv}
                retning="vertikal"
            />
            <OppsummeringPar
                label={formatMessage('oppsummering.tilbakekrevingsbehandling.sendtTilAttesteringAv')}
                verdi={props.behandling.sendtTilAttesteringAv}
                retning="vertikal"
            />
        </div>
    );
};

const OppsummeringAvBrev = (props: { behandling: ManuellTilbakekrevingsbehandling }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Email}
            farge={Oppsummeringsfarge.Limegrønn}
            tittel={formatMessage('oppsummering.tilbakekrevingsbehandling.brev.panel.tittel')}
        >
            <VisVedtaksbrevKomponent behandling={props.behandling} />
            <hr />
            <VisUtsendtForhåndsvarselKomponent behandling={props.behandling} />
        </Oppsummeringspanel>
    );
};

const VisVedtaksbrevKomponent = (props: { behandling: ManuellTilbakekrevingsbehandling }) => {
    const { formatMessage } = useI18n({ messages });

    const [brevStatus, hentBrev] = useApiCall(forhåndsvisVedtaksbrevTilbakekrevingsbehandling);
    return (
        <div>
            {props.behandling.fritekst ? (
                <div>
                    <Heading size="small" spacing>
                        {formatMessage('oppsummering.tilbakekrevingsbehandling.brev.vedtaksbrev.heading')}
                    </Heading>
                    <Button
                        variant="tertiary"
                        size="small"
                        type="button"
                        loading={RemoteData.isPending(brevStatus)}
                        onClick={() =>
                            hentBrev({ sakId: props.behandling.sakId, behandlingId: props.behandling.id }, (res) => {
                                window.open(URL.createObjectURL(res));
                            })
                        }
                    >
                        {formatMessage('oppsummering.tilbakekrevingsbehandling.brev.knapp.seVedtaksbrev')}
                    </Button>

                    {RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}
                </div>
            ) : (
                <Heading size="small" spacing>
                    {formatMessage('oppsummering.tilbakekrevingsbehandling.brev.skalIkkeSendeBrev')}
                </Heading>
            )}
        </div>
    );
};

const VisUtsendtForhåndsvarselKomponent = (props: { behandling: ManuellTilbakekrevingsbehandling }) => {
    const { formatMessage } = useI18n({ messages });

    return props.behandling.forhåndsvarselsInfo.length > 0 ? (
        <div>
            <Heading size="small" spacing>
                {formatMessage('oppsummering.tilbakekrevingsbehandling.brev.forhåndsvarsel.heading')}
            </Heading>
            {props.behandling.forhåndsvarselsInfo.map((info) => (
                <TidligereSendtForhåndsvarsler
                    key={info.id}
                    sakId={props.behandling.sakId}
                    behandlingId={props.behandling.id}
                    forhåndsvarselInfo={info}
                />
            ))}
        </div>
    ) : (
        <Label>{formatMessage('oppsummering.tilbakekrevingsbehandling.brev.forhåndsvarsel.ingenSendt')}</Label>
    );
};

export default OppsummeringAvTilbakekrevingsbehandling;
