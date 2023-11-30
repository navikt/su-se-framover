import * as RemoteData from '@devexperts/remote-data-ts';
import { Accordion, Button, Heading, Label } from '@navikt/ds-react';
import AccordionItem from '@navikt/ds-react/esm/accordion/AccordionItem';
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
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvTilbakekrevingsbehandling-nb';
import styles from './OppsummeringAvTilbakekrevingsbehandling.module.less';

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

                <OppsummeringAvVurdering behandling={props.behandling} />
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

const OppsummeringAvVurdering = (props: { behandling: ManuellTilbakekrevingsbehandling }) => {
    const { formatMessage } = useI18n({ messages });

    if (!props.behandling.vurderinger) {
        return (
            <div>
                <Label>Behandlingen har ingen vurderinger knyttet til et kravgrunnlag</Label>
            </div>
        );
    }

    return (
        <div>
            <Accordion variant="neutral">
                {props.behandling.vurderinger.perioder.map((periode) => (
                    <AccordionItem key={`${periode.periode.fraOgMed} - ${periode.periode.tilOgMed}`}>
                        <Accordion.Header className={styles.accordionHeader}>
                            <div className={styles.detalje}>
                                <OppsummeringPar
                                    label={formatMessage('oppsummering.tilbakekrevingsbehandling.vurdering.periode')}
                                    verdi={`${formatDate(periode.periode.fraOgMed)} - ${formatDate(
                                        periode.periode.tilOgMed,
                                    )}`}
                                    retning="vertikal"
                                />
                                <OppsummeringPar
                                    label={formatMessage('oppsummering.tilbakekrevingsbehandling.vurdering.vurdering')}
                                    verdi={formatMessage(
                                        `oppsummering.tilbakekrevingsbehandling.vurdering.vurdering.${periode.vurdering}`,
                                    )}
                                    retning="vertikal"
                                />
                            </div>
                        </Accordion.Header>
                        <Accordion.Content>
                            <div className={styles.kravgrunnlagsInfoContainer}>
                                <div className={styles.detalje}>
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.vurdering.betaltSkattForYtelsesgruppen',
                                        )}
                                        verdi={periode.betaltSkattForYtelsesgruppen}
                                        retning="vertikal"
                                    />
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.vurdering.skatteprosent',
                                        )}
                                        verdi={periode.skatteProsent}
                                        retning="vertikal"
                                    />
                                </div>

                                <div className={styles.detalje}>
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.vurdering.bruttoTidligereUtbetalt',
                                        )}
                                        verdi={periode.bruttoTidligereUtbetalt}
                                        retning="vertikal"
                                    />
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.vurdering.bruttoNyUtbetaling',
                                        )}
                                        verdi={periode.bruttoNyUtbetaling}
                                        retning="vertikal"
                                    />
                                </div>
                                <div className={styles.detalje}>
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.vurdering.bruttoSkalTilbakekreve',
                                        )}
                                        verdi={periode.bruttoSkalTilbakekreve}
                                        retning="vertikal"
                                    />
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.vurdering.bruttoSkalIkkeTilbakekreve',
                                        )}
                                        verdi={periode.bruttoSkalIkkeTilbakekreve}
                                        retning="vertikal"
                                    />
                                </div>
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.vurdering.nettoSkalTilbakekreve',
                                    )}
                                    verdi={periode.nettoSkalTilbakekreve}
                                    retning="vertikal"
                                />
                            </div>
                        </Accordion.Content>
                    </AccordionItem>
                ))}

                <AccordionItem>
                    <Accordion.Header>
                        {formatMessage('oppsummering.tilbakekrevingsbehandling.vurdering.summert.heading')}
                    </Accordion.Header>
                    <Accordion.Content>
                        <div className={styles.kravgrunnlagsInfoContainer}>
                            <OppsummeringPar
                                label={formatMessage(
                                    'oppsummering.tilbakekrevingsbehandling.vurdering.summert.betaltSkattForYtelsesgruppen',
                                )}
                                verdi={props.behandling.vurderinger.betaltSkattForYtelsesgruppenSummert}
                                retning="vertikal"
                            />
                            <div className={styles.detalje}>
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoTidligereUtbetalt',
                                    )}
                                    verdi={props.behandling.vurderinger.bruttoTidligereUtbetaltSummert}
                                    retning="vertikal"
                                />
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoNyUtbetaling',
                                    )}
                                    verdi={props.behandling.vurderinger.bruttoNyUtbetalingSummert}
                                    retning="vertikal"
                                />
                            </div>
                            <div className={styles.detalje}>
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoSkalTilbakekreve',
                                    )}
                                    verdi={props.behandling.vurderinger.bruttoSkalTilbakekreveSummert}
                                    retning="vertikal"
                                />
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoSkalIkkeTilbakekreve',
                                    )}
                                    verdi={props.behandling.vurderinger.bruttoSkalIkkeTilbakekreveSummert}
                                    retning="vertikal"
                                />
                            </div>
                            <OppsummeringPar
                                label={formatMessage(
                                    'oppsummering.tilbakekrevingsbehandling.vurdering.summert.nettoSkalTilbakekreve',
                                )}
                                verdi={props.behandling.vurderinger.nettoSkalTilbakekreveSummert}
                                retning="vertikal"
                            />
                        </div>
                    </Accordion.Content>
                </AccordionItem>
            </Accordion>
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
