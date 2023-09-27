import { Heading, Accordion } from '@navikt/ds-react';
import AccordionItem from '@navikt/ds-react/esm/accordion/AccordionItem';
import React from 'react';

import Oppsummeringspanel, {
    Oppsummeringsikon,
    Oppsummeringsfarge,
} from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import { useI18n } from '~src/lib/i18n';
import { Kravgrunnlag, Grunnlagsperiode } from '~src/types/Kravgrunnlag';
import { formatMonthYear } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvKravgrunnlag-nb';
import styles from './OppsummeringAvKravgrunnlag.module.less';

const OppsummeringAvKravgrunnlag = (props: { kravgrunnlag: Kravgrunnlag; visSomEnkeltPanel?: boolean }) => {
    const { formatMessage } = useI18n({ messages });

    if (props.visSomEnkeltPanel) {
        return (
            <div>
                <OppsummeringAvKravgrunnlagMetaInfo kravgrunnlag={props.kravgrunnlag} />
                <OppsummeringAvGrunnlagsPerioder grunnlagsperiode={props.kravgrunnlag.grunnlagsperiode} />
            </div>
        );
    } else {
        return (
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Liste}
                farge={Oppsummeringsfarge.Lilla}
                tittel={formatMessage('kravgrunnlag.tittel')}
            >
                <OppsummeringAvKravgrunnlagMetaInfo kravgrunnlag={props.kravgrunnlag} />
                <OppsummeringAvGrunnlagsPerioder grunnlagsperiode={props.kravgrunnlag.grunnlagsperiode} />
            </Oppsummeringspanel>
        );
    }
};

const OppsummeringAvKravgrunnlagMetaInfo = (props: { kravgrunnlag: Kravgrunnlag }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.kravgrunnlagOppsummeringContainer}>
            <OppsummeringPar
                label={formatMessage('kravgrunnlag.id')}
                verdi={props.kravgrunnlag.eksternKravgrunnlagsId}
                retning="vertikal"
            />

            <OppsummeringPar
                label={formatMessage('kravgrunnlag.vedtakId')}
                verdi={props.kravgrunnlag.eksternVedtakId}
                retning="vertikal"
            />
            <OppsummeringPar
                label={formatMessage('kravgrunnlag.status')}
                verdi={props.kravgrunnlag.status}
                retning="vertikal"
            />
            <OppsummeringPar
                label={formatMessage('kravgrunnlag.kontrollfelt')}
                verdi={props.kravgrunnlag.kontrollfelt}
                retning="vertikal"
            />
        </div>
    );
};

const OppsummeringAvGrunnlagsPerioder = (props: { grunnlagsperiode: Grunnlagsperiode[] }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Heading size="small">{formatMessage('kravgrunnlag.grunnlagsperiode.tittel')}</Heading>

            <Accordion variant="neutral">
                {props.grunnlagsperiode.map((periode) => (
                    <AccordionItem key={`${periode.periode.fraOgMed}-${periode.periode.tilOgMed}`}>
                        <Accordion.Header className={styles.accordionHeader}>
                            {`${formatMonthYear(periode.periode.fraOgMed)} - ${formatMonthYear(
                                periode.periode.tilOgMed,
                            )}`}
                        </Accordion.Header>

                        <Accordion.Content>
                            <div>
                                <OppsummeringPar
                                    label={formatMessage('kravgrunnlag.grunnlagsperiode.beløpSkattMnd')}
                                    verdi={periode.beløpSkattMnd}
                                    retning="vertikal"
                                />
                            </div>
                            <hr></hr>
                            {periode.grunnlagsbeløp.map((beløp, i) => (
                                <li key={i} className={styles.grunnlagsbeløperContainer}>
                                    <div className={styles.grunnlagsbeløpContainer}>
                                        <OppsummeringPar
                                            label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.kode')}
                                            verdi={beløp.kode}
                                            retning="vertikal"
                                        />
                                        <OppsummeringPar
                                            label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.type')}
                                            verdi={beløp.type}
                                            retning="vertikal"
                                        />
                                    </div>

                                    <div className={styles.grunnlagsbeløpContainer}>
                                        <OppsummeringPar
                                            label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.skatteProsent')}
                                            verdi={beløp.skatteProsent}
                                            retning="vertikal"
                                        />
                                    </div>

                                    <div className={styles.grunnlagsbeløpContainer}>
                                        <OppsummeringPar
                                            label={formatMessage(
                                                'kravgrunnlag.grunnlagsperiode.beløp.beløpNyUtbetaling',
                                            )}
                                            verdi={beløp.beløpNyUtbetaling}
                                            retning="vertikal"
                                        />
                                        <OppsummeringPar
                                            label={formatMessage(
                                                'kravgrunnlag.grunnlagsperiode.beløp.beløpTidligereUtbetaling',
                                            )}
                                            verdi={beløp.beløpTidligereUtbetaling}
                                            retning="vertikal"
                                        />
                                    </div>
                                    <div className={styles.grunnlagsbeløpContainer}>
                                        <OppsummeringPar
                                            label={formatMessage(
                                                'kravgrunnlag.grunnlagsperiode.beløp.beløpSkalTilbakekreves',
                                            )}
                                            verdi={beløp.beløpSkalTilbakekreves}
                                            retning="vertikal"
                                        />
                                        <OppsummeringPar
                                            label={formatMessage(
                                                'kravgrunnlag.grunnlagsperiode.beløp.beløpSkalIkkeTilbakekreves',
                                            )}
                                            verdi={beløp.beløpSkalIkkeTilbakekreves}
                                            retning="vertikal"
                                        />
                                    </div>
                                </li>
                            ))}
                        </Accordion.Content>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default OppsummeringAvKravgrunnlag;