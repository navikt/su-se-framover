import { Accordion, Heading, Label } from '@navikt/ds-react';
import AccordionItem from '@navikt/ds-react/esm/accordion/AccordionItem';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { VurderingMedKrav } from '~src/types/ManuellTilbakekrevingsbehandling';
import { formatDate } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../../oppsummeringpar/OppsummeringPar';
import messages from '../OppsummeringAvTilbakekrevingsbehandling-nb';

import styles from './OppsummeringAvVurdering.module.less';

const OppsummeringAvVurderingBasic = (props: { vurderinger: VurderingMedKrav; medTittel?: boolean }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            {props.medTittel && (
                <Heading size="medium" spacing>
                    {formatMessage('oppsummering.tilbakekrevingsbehandling.vurdering.tittel')}
                </Heading>
            )}

            <div className={styles.eksternInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('oppsummering.tilbakekrevingsbehandling.vurdering.eksternKravgrunnlagId')}
                    verdi={props.vurderinger.eksternKravgrunnlagId}
                    retning="vertikal"
                />

                <OppsummeringPar
                    label={formatMessage('oppsummering.tilbakekrevingsbehandling.vurdering.eksternVedtakId')}
                    verdi={props.vurderinger.eksternVedtakId}
                    retning="vertikal"
                />
                <OppsummeringPar
                    label={formatMessage('oppsummering.tilbakekrevingsbehandling.vurdering.eksternKontrollfelt')}
                    verdi={props.vurderinger.eksternKontrollfelt}
                    retning="vertikal"
                />
            </div>
            <ul className={styles.perioderContainer}>
                {props.vurderinger.perioder.map((periode) => (
                    <li key={`${periode.periode.fraOgMed}-${periode.periode.tilOgMed}`}>
                        <div className={styles.vurderingsdataContainer}>
                            <div className={styles.detaljeHeading}>
                                <div>
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.vurdering.periode',
                                        )}
                                        verdi={`${formatDate(periode.periode.fraOgMed)} - ${formatDate(
                                            periode.periode.tilOgMed,
                                        )}`}
                                        retning="vertikal"
                                    />
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'oppsummering.tilbakekrevingsbehandling.vurdering.vurdering',
                                        )}
                                        verdi={formatMessage(
                                            `oppsummering.tilbakekrevingsbehandling.vurdering.vurdering.${periode.vurdering}`,
                                        )}
                                        retning="vertikal"
                                    />
                                </div>
                                <hr></hr>
                            </div>
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
                    </li>
                ))}
                <hr />
            </ul>

            <div>
                <Heading size="small" spacing>
                    {formatMessage('oppsummering.tilbakekrevingsbehandling.vurdering.summert.heading')}
                </Heading>
                <div className={styles.vurderingsdataContainer}>
                    <OppsummeringPar
                        label={formatMessage(
                            'oppsummering.tilbakekrevingsbehandling.vurdering.summert.betaltSkattForYtelsesgruppen',
                        )}
                        verdi={props.vurderinger.betaltSkattForYtelsesgruppenSummert}
                        retning="vertikal"
                    />

                    <div className={styles.detalje}>
                        <OppsummeringPar
                            label={formatMessage(
                                'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoTidligereUtbetalt',
                            )}
                            verdi={props.vurderinger.bruttoTidligereUtbetaltSummert}
                            retning="vertikal"
                        />
                        <OppsummeringPar
                            label={formatMessage(
                                'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoNyUtbetaling',
                            )}
                            verdi={props.vurderinger.bruttoNyUtbetalingSummert}
                            retning="vertikal"
                        />
                    </div>

                    <div className={styles.detalje}>
                        <OppsummeringPar
                            label={formatMessage(
                                'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoSkalTilbakekreve',
                            )}
                            verdi={props.vurderinger.bruttoSkalTilbakekreveSummert}
                            retning="vertikal"
                        />
                        <OppsummeringPar
                            label={formatMessage(
                                'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoSkalIkkeTilbakekreve',
                            )}
                            verdi={props.vurderinger.bruttoSkalIkkeTilbakekreveSummert}
                            retning="vertikal"
                        />
                    </div>
                    <OppsummeringPar
                        label={formatMessage(
                            'oppsummering.tilbakekrevingsbehandling.vurdering.summert.nettoSkalTilbakekreve',
                        )}
                        verdi={props.vurderinger.nettoSkalTilbakekreveSummert}
                        retning="vertikal"
                    />
                </div>
            </div>
        </div>
    );
};

const OppsummeringAvVurdering = (props: {
    vurderinger: Nullable<VurderingMedKrav>;
    basic?: { medTittel?: boolean };
}) => {
    const { formatMessage } = useI18n({ messages });

    if (!props.vurderinger) {
        return (
            <div>
                <Label>Behandlingen har ingen vurderinger knyttet til et kravgrunnlag</Label>
            </div>
        );
    }

    if (props.basic) {
        return <OppsummeringAvVurderingBasic vurderinger={props.vurderinger} medTittel={props.basic.medTittel} />;
    }

    return (
        <div>
            <Accordion variant="neutral">
                {props.vurderinger.perioder.map((periode) => (
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
                                verdi={props.vurderinger.betaltSkattForYtelsesgruppenSummert}
                                retning="vertikal"
                            />
                            <div className={styles.detalje}>
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoTidligereUtbetalt',
                                    )}
                                    verdi={props.vurderinger.bruttoTidligereUtbetaltSummert}
                                    retning="vertikal"
                                />
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoNyUtbetaling',
                                    )}
                                    verdi={props.vurderinger.bruttoNyUtbetalingSummert}
                                    retning="vertikal"
                                />
                            </div>
                            <div className={styles.detalje}>
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoSkalTilbakekreve',
                                    )}
                                    verdi={props.vurderinger.bruttoSkalTilbakekreveSummert}
                                    retning="vertikal"
                                />
                                <OppsummeringPar
                                    label={formatMessage(
                                        'oppsummering.tilbakekrevingsbehandling.vurdering.summert.bruttoSkalIkkeTilbakekreve',
                                    )}
                                    verdi={props.vurderinger.bruttoSkalIkkeTilbakekreveSummert}
                                    retning="vertikal"
                                />
                            </div>
                            <OppsummeringPar
                                label={formatMessage(
                                    'oppsummering.tilbakekrevingsbehandling.vurdering.summert.nettoSkalTilbakekreve',
                                )}
                                verdi={props.vurderinger.nettoSkalTilbakekreveSummert}
                                retning="vertikal"
                            />
                        </div>
                    </Accordion.Content>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default OppsummeringAvVurdering;
