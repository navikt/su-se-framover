import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyLong, Button, Heading, Label } from '@navikt/ds-react';

import { forhåndsvisVedtaksbrevTilbakekrevingsbehandling } from '~src/api/tilbakekrevingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import UnderkjenteAttesteringer from '~src/components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { TidligereSendtForhåndsvarsler } from '~src/pages/saksbehandling/tilbakekreving/behandleTilbakekreving/forhåndsvarsleTilbakekreving/ForhåndsvarsleTilbakekreving';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';
import { formatDateTime } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import styles from './OppsummeringAvTilbakekrevingsbehandling.module.less';
import messages from './OppsummeringAvTilbakekrevingsbehandling-nb';
import OppsummeringAvVurdering from './vurdering/OppsummeringAvVurdering';

const OppsummeringAvTilbakekrevingsbehandling = (props: {
    behandling: ManuellTilbakekrevingsbehandling;
    utenPanel?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.oppsummeringspageContainer}>
            {props.utenPanel ? (
                <>
                    <OppsummeringAvMetaInformasjon behandling={props.behandling} />
                    <UnderkjenteAttesteringer attesteringer={props.behandling.attesteringer} />
                    <OppsummeringAvVurdering vurderinger={props.behandling.vurderinger} />

                    {props.behandling.notat && (
                        <div>
                            <Heading size="small" level="6" spacing>
                                {formatMessage('oppsummering.tilbakekrevingsbehandling.panel.notat.tittel')}
                            </Heading>
                            <BodyLong className={styles.notat} spacing>
                                {props.behandling.notat}
                            </BodyLong>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <Oppsummeringspanel
                        ikon={Oppsummeringsikon.Liste}
                        farge={Oppsummeringsfarge.Lilla}
                        tittel={formatMessage('oppsummering.tilbakekrevingsbehandling.panel.tittel')}
                        classNameChildren={styles.oppsummeringspanel}
                    >
                        <OppsummeringAvMetaInformasjon behandling={props.behandling} />
                        <UnderkjenteAttesteringer attesteringer={props.behandling.attesteringer} />
                        <OppsummeringAvVurdering vurderinger={props.behandling.vurderinger} />

                        {props.behandling.notat && (
                            <div>
                                <Heading size="small" level="6" spacing>
                                    {formatMessage('oppsummering.tilbakekrevingsbehandling.panel.notat.tittel')}
                                </Heading>
                                <BodyLong className={styles.notat} spacing>
                                    {props.behandling.notat}
                                </BodyLong>
                            </div>
                        )}
                    </Oppsummeringspanel>
                    <OppsummeringAvTilbakekrevingsbehandlingbrev behandling={props.behandling} />
                </>
            )}
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
                verdi={props.behandling.sendtTilAttesteringAv ?? '-'}
                retning="vertikal"
            />
        </div>
    );
};

export const OppsummeringAvTilbakekrevingsbehandlingbrev = (props: {
    behandling: ManuellTilbakekrevingsbehandling;
    utenVedtaksbrev?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Email}
            farge={Oppsummeringsfarge.Limegrønn}
            tittel={
                props.utenVedtaksbrev
                    ? formatMessage('oppsummering.tilbakekrevingsbehandling.brev.panel.tittel.utenVedtaksbrev')
                    : formatMessage('oppsummering.tilbakekrevingsbehandling.brev.panel.tittel')
            }
        >
            {!props.utenVedtaksbrev && (
                <>
                    <VisVedtaksbrevKomponent behandling={props.behandling} />
                    <hr />
                </>
            )}
            <VisUtsendtForhåndsvarselKomponent behandling={props.behandling} utenTittel={props.utenVedtaksbrev} />
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

const VisUtsendtForhåndsvarselKomponent = (props: {
    behandling: ManuellTilbakekrevingsbehandling;
    utenTittel?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });

    return props.behandling.forhåndsvarselsInfo.length > 0 ? (
        <div>
            {!props.utenTittel && (
                <Heading size="small" spacing>
                    {formatMessage('oppsummering.tilbakekrevingsbehandling.brev.forhåndsvarsel.heading')}
                </Heading>
            )}
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
