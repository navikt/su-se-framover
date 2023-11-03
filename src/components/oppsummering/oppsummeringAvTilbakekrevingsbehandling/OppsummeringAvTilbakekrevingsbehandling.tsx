import * as RemoteData from '@devexperts/remote-data-ts';
import { Accordion, Button } from '@navikt/ds-react';
import AccordionItem from '@navikt/ds-react/esm/accordion/AccordionItem';
import React, { useState } from 'react';

import { ApiError } from '~src/api/apiClient';
import { forhåndsvisVedtaksbrevTilbakekrevingsbehandling } from '~src/api/tilbakekrevingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Oppsummeringspanel, {
    Oppsummeringsikon,
    Oppsummeringsfarge,
} from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import UnderkjenteAttesteringer from '~src/components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useI18n } from '~src/lib/i18n';
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
                            </div>
                        </Accordion.Content>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

const OppsummeringAvBrev = (props: { behandling: ManuellTilbakekrevingsbehandling }) => {
    const { formatMessage } = useI18n({ messages });

    const [hentBrevStatus, setHentBrevStatus] = useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);

    const onSeBrevClick = async () => {
        if (RemoteData.isPending(hentBrevStatus)) return;

        setHentBrevStatus(RemoteData.pending);

        const res = await forhåndsvisVedtaksbrevTilbakekrevingsbehandling({
            sakId: props.behandling.sakId,
            behandlingId: props.behandling.id,
        });

        if (res.status === 'ok') {
            setHentBrevStatus(RemoteData.success(null));
            window.open(URL.createObjectURL(res.data));
        } else {
            setHentBrevStatus(RemoteData.failure(res.error));
        }
    };

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Email}
            farge={Oppsummeringsfarge.Limegrønn}
            tittel={formatMessage('oppsummering.tilbakekrevingsbehandling.brev.panel.tittel')}
        >
            {props.behandling.fritekst ? (
                <div>
                    <Button
                        variant="secondary"
                        className={styles.brevButton}
                        type="button"
                        loading={RemoteData.isPending(hentBrevStatus)}
                        onClick={onSeBrevClick}
                    >
                        {formatMessage('oppsummering.tilbakekrevingsbehandling.brev.knapp.seVedtaksbrev')}
                    </Button>

                    {RemoteData.isFailure(hentBrevStatus) && <ApiErrorAlert error={hentBrevStatus.error} />}
                </div>
            ) : (
                'Skal ikke sende vedtaksbrev'
            )}

            {props.behandling.forhåndsvarselDokumenter.map((dokument) => (
                <p key={dokument}>{dokument} - knapp for å se denne skal komme snart</p>
            ))}
        </Oppsummeringspanel>
    );
};

export default OppsummeringAvTilbakekrevingsbehandling;
