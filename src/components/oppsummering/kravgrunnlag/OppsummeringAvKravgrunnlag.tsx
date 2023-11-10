import { Heading, Accordion } from '@navikt/ds-react';
import AccordionItem from '@navikt/ds-react/esm/accordion/AccordionItem';
import React from 'react';

import Oppsummeringspanel, {
    Oppsummeringsikon,
    Oppsummeringsfarge,
} from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import { useI18n } from '~src/lib/i18n';
import { Kravgrunnlag, Grunnlagsperiode } from '~src/types/Kravgrunnlag';
import Måned from '~src/types/Måned';
import { formatMonthYear } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvKravgrunnlag-nb';
import styles from './OppsummeringAvKravgrunnlag.module.less';

const OppsummeringAvKravgrunnlag = (props: {
    kravgrunnlag: Kravgrunnlag;
    bareOppsummerMetaInfo?: { medTittel?: boolean; headerContent?: React.ReactNode };
    basicOppsummeringAvHeleKravgrunnlaget?: { medTittel?: boolean; headerContent?: React.ReactNode };
}) => {
    const { formatMessage } = useI18n({ messages });

    if (props.bareOppsummerMetaInfo) {
        return (
            <OppsummeringAvMetaInfo
                kravgrunnlag={props.kravgrunnlag}
                medTittel={props.bareOppsummerMetaInfo.medTittel}
                headerContent={props.bareOppsummerMetaInfo.headerContent}
            />
        );
    } else if (props.basicOppsummeringAvHeleKravgrunnlaget) {
        return (
            <div>
                <OppsummeringAvMetaInfo
                    kravgrunnlag={props.kravgrunnlag}
                    medTittel={props.basicOppsummeringAvHeleKravgrunnlaget.medTittel}
                    headerContent={props.basicOppsummeringAvHeleKravgrunnlaget.headerContent}
                />
                <OppsummeringAvGrunnlagsperioderBasic grunnlagsperiode={props.kravgrunnlag.grunnlagsperiode} />
            </div>
        );
    } else {
        return (
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Liste}
                farge={Oppsummeringsfarge.Lilla}
                tittel={formatMessage('kravgrunnlag.tittel')}
            >
                <OppsummeringAvMetaInfo kravgrunnlag={props.kravgrunnlag} />
                <OppsummeringAvGrunnlagsPerioderAccordion grunnlagsperiode={props.kravgrunnlag.grunnlagsperiode} />
            </Oppsummeringspanel>
        );
    }
};

const OppsummeringAvMetaInfo = (props: {
    kravgrunnlag: Kravgrunnlag;
    medTittel?: boolean;
    headerContent?: React.ReactNode;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <div className={styles.metaHeaderContainer}>
                {props.medTittel && (
                    <Heading className={styles.metaInfoTittel} size="medium">
                        {formatMessage('kravgrunnlag.utestående.tittel')}
                    </Heading>
                )}
                {props.headerContent && props.headerContent}
            </div>

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
        </div>
    );
};

const OppsummeringAvGrunnlagsperioderBasic = (props: { grunnlagsperiode: Grunnlagsperiode[] }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Heading size="small">{formatMessage('kravgrunnlag.grunnlagsperiode.tittel')}</Heading>

            {props.grunnlagsperiode.map((periode) => (
                <div key={`${periode.periode.fraOgMed}-${periode.periode.tilOgMed}`}>
                    <div className={styles.grunnlagsbeløperContainer}>
                        <div className={styles.grunnlagsbeløpContainer}>
                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.periode')}
                                verdi={`${Måned.fromStringPeriode(periode.periode).toFormattedString()}`}
                                retning="vertikal"
                            />
                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløpSkattMnd')}
                                verdi={periode.beløpSkattMnd}
                                retning="vertikal"
                            />
                        </div>
                    </div>
                    <hr></hr>
                    <div className={styles.grunnlagsbeløperContainer}>
                        <div className={styles.grunnlagsbeløpContainer}>
                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.skatteProsent')}
                                verdi={periode.ytelse.skatteProsent}
                                retning="vertikal"
                            />
                        </div>

                        <div className={styles.grunnlagsbeløpContainer}>
                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.beløpNyUtbetaling')}
                                verdi={periode.ytelse.beløpNyUtbetaling}
                                retning="vertikal"
                            />
                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.beløpTidligereUtbetaling')}
                                verdi={periode.ytelse.beløpTidligereUtbetaling}
                                retning="vertikal"
                            />
                        </div>
                        <div className={styles.grunnlagsbeløpContainer}>
                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.beløpSkalTilbakekreves')}
                                verdi={periode.ytelse.beløpSkalTilbakekreves}
                                retning="vertikal"
                            />
                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.beløpSkalIkkeTilbakekreves')}
                                verdi={periode.ytelse.beløpSkalIkkeTilbakekreves}
                                retning="vertikal"
                            />
                        </div>
                        <OppsummeringPar
                            label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.nettoBeløp')}
                            verdi={periode.ytelse.nettoBeløp}
                            retning="vertikal"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const OppsummeringAvGrunnlagsPerioderAccordion = (props: { grunnlagsperiode: Grunnlagsperiode[] }) => {
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
                            <div className={styles.grunnlagsbeløperContainer}>
                                <div className={styles.grunnlagsbeløpContainer}>
                                    <OppsummeringPar
                                        label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.skatteProsent')}
                                        verdi={periode.ytelse.skatteProsent}
                                        retning="vertikal"
                                    />
                                </div>

                                <div className={styles.grunnlagsbeløpContainer}>
                                    <OppsummeringPar
                                        label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.beløpNyUtbetaling')}
                                        verdi={periode.ytelse.beløpNyUtbetaling}
                                        retning="vertikal"
                                    />
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'kravgrunnlag.grunnlagsperiode.beløp.beløpTidligereUtbetaling',
                                        )}
                                        verdi={periode.ytelse.beløpTidligereUtbetaling}
                                        retning="vertikal"
                                    />
                                </div>
                                <div className={styles.grunnlagsbeløpContainer}>
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'kravgrunnlag.grunnlagsperiode.beløp.beløpSkalTilbakekreves',
                                        )}
                                        verdi={periode.ytelse.beløpSkalTilbakekreves}
                                        retning="vertikal"
                                    />
                                    <OppsummeringPar
                                        label={formatMessage(
                                            'kravgrunnlag.grunnlagsperiode.beløp.beløpSkalIkkeTilbakekreves',
                                        )}
                                        verdi={periode.ytelse.beløpSkalIkkeTilbakekreves}
                                        retning="vertikal"
                                    />
                                </div>
                                <OppsummeringPar
                                    label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.nettoBeløp')}
                                    verdi={periode.ytelse.nettoBeløp}
                                    retning="vertikal"
                                />
                            </div>
                        </Accordion.Content>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default OppsummeringAvKravgrunnlag;
