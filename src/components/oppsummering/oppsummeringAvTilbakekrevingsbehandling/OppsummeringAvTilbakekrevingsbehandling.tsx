import * as RemoteData from '@devexperts/remote-data-ts';
import { Accordion, Button, Heading, Label } from '@navikt/ds-react';
import AccordionItem from '@navikt/ds-react/esm/accordion/AccordionItem';
import React from 'react';

import { forhåndsvisVedtaksbrevTilbakekrevingsbehandling } from '~src/api/tilbakekrevingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Oppsummeringspanel, {
    Oppsummeringsikon,
    Oppsummeringsfarge,
} from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import UnderkjenteAttesteringer from '~src/components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { TidligereSendtForhåndsvarsler } from '~src/pages/saksbehandling/tilbakekreving/behandleTilbakekreving/forhåndsvarsleTilbakekreving/ForhåndsvarsleTilbakekreving';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';
import Måned from '~src/types/Måned';
import { formatDateTime } from '~src/utils/date/dateUtils';

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

    const månedsvurderingerMedKravgrunnlagsperiode = [];

    for (const månedsvurdering of props.behandling.månedsvurderinger) {
        const matched = props.behandling.kravgrunnlag.grunnlagsperiode.find(
            (grunnlagsperiode) =>
                Måned.fromStringPeriode(grunnlagsperiode.periode).toString() === månedsvurdering.måned,
        )!;

        if (!matched) throw new Error('Månedsvurdering mangler grunnlagsperiode');

        månedsvurderingerMedKravgrunnlagsperiode.push({ ...månedsvurdering, ...matched });
    }

    return (
        <div>
            <Accordion variant="neutral">
                {månedsvurderingerMedKravgrunnlagsperiode.map((månedsvurderingOgGrunnlagsperiode) => (
                    <AccordionItem key={månedsvurderingOgGrunnlagsperiode.måned}>
                        <Accordion.Header className={styles.accordionHeader}>
                            <div className={styles.detalje}>
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.månedsvurdering.måned',
                                    )}
                                    verdi={månedsvurderingOgGrunnlagsperiode.måned}
                                    retning="vertikal"
                                />
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.månedsvurdering.vurdering',
                                    )}
                                    verdi={formatMessage(
                                        `oppsummering.tilbakekrevingsbehandling.månedsvurdering.vurdering.${månedsvurderingOgGrunnlagsperiode.vurdering}`,
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
                                            'oppsummering.tilbakekrevingsbehandling.månedsvurdering.skatteBeløp',
                                        )}
                                        verdi={månedsvurderingOgGrunnlagsperiode.beløpSkattMnd}
                                        retning="vertikal"
                                    />
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.månedsvurdering.skatteprosent',
                                        )}
                                        verdi={månedsvurderingOgGrunnlagsperiode.ytelse.skatteProsent}
                                        retning="vertikal"
                                    />
                                </div>

                                <div className={styles.detalje}>
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.månedsvurdering.tidligereUtbetalt',
                                        )}
                                        verdi={månedsvurderingOgGrunnlagsperiode.ytelse.beløpTidligereUtbetaling}
                                        retning="vertikal"
                                    />
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.månedsvurdering.nyUtbetaling',
                                        )}
                                        verdi={månedsvurderingOgGrunnlagsperiode.ytelse.beløpNyUtbetaling}
                                        retning="vertikal"
                                    />
                                </div>
                                <div className={styles.detalje}>
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.månedsvurdering.skalTilbakekreves',
                                        )}
                                        verdi={månedsvurderingOgGrunnlagsperiode.ytelse.beløpSkalTilbakekreves}
                                        retning="vertikal"
                                    />
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.månedsvurdering.skalIkkeTilbakekreves',
                                        )}
                                        verdi={månedsvurderingOgGrunnlagsperiode.ytelse.beløpSkalIkkeTilbakekreves}
                                        retning="vertikal"
                                    />
                                </div>
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.månedsvurdering.nettoBeløp',
                                    )}
                                    verdi={månedsvurderingOgGrunnlagsperiode.ytelse.nettoBeløp}
                                    retning="vertikal"
                                />
                            </div>
                        </Accordion.Content>
                    </AccordionItem>
                ))}

                <AccordionItem>
                    <Accordion.Header>
                        {formatMessage('oppsummering.tilbakekrevingsbehandling.totalgrunnlagsperiode.heading')}
                    </Accordion.Header>
                    <Accordion.Content>
                        <div className={styles.kravgrunnlagsInfoContainer}>
                            <OppsummeringPar
                                label={formatMessage(
                                    'oppsummering.tilbakekrevingsbehandling.totalgrunnlagsperiode.betaltSkattForYtelsesgruppen',
                                )}
                                verdi={
                                    props.behandling.kravgrunnlag.summertGrunnlagsmåneder.betaltSkattForYtelsesgruppen
                                }
                                retning="vertikal"
                            />
                            <div className={styles.detalje}>
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.månedsvurdering.tidligereUtbetalt',
                                    )}
                                    verdi={
                                        props.behandling.kravgrunnlag.summertGrunnlagsmåneder.beløpTidligereUtbetaling
                                    }
                                    retning="vertikal"
                                />
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.månedsvurdering.nyUtbetaling',
                                    )}
                                    verdi={props.behandling.kravgrunnlag.summertGrunnlagsmåneder.beløpNyUtbetaling}
                                    retning="vertikal"
                                />
                            </div>
                            <div className={styles.detalje}>
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.månedsvurdering.skalTilbakekreves',
                                    )}
                                    verdi={props.behandling.kravgrunnlag.summertGrunnlagsmåneder.beløpSkalTilbakekreves}
                                    retning="vertikal"
                                />
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.månedsvurdering.skalIkkeTilbakekreves',
                                    )}
                                    verdi={
                                        props.behandling.kravgrunnlag.summertGrunnlagsmåneder.beløpSkalIkkeTilbakekreves
                                    }
                                    retning="vertikal"
                                />
                            </div>
                            <OppsummeringPar
                                label={formatMessage(
                                    'oppsummering.tilbakekrevingsbehandling.månedsvurdering.nettoBeløp',
                                )}
                                verdi={props.behandling.kravgrunnlag.summertGrunnlagsmåneder.nettoBeløp}
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
