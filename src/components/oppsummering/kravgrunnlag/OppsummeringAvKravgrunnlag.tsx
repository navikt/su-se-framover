import { Heading, Accordion } from '@navikt/ds-react';
import AccordionItem from '@navikt/ds-react/esm/accordion/AccordionItem';
import classNames from 'classnames';
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
    bareOppsummerMetaInfo?: { medTittel?: boolean };
    basicOppsummeringAvHeleKravgrunnlaget?: { medTittel?: boolean };
    oppsummeringMedPanel?: {
        tittel?: string;
        farge?: Oppsummeringsfarge;
        ikon?: Oppsummeringsikon;
    };
    kompakt?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });

    if (props.bareOppsummerMetaInfo) {
        return (
            <OppsummeringAvMetaInfo
                kravgrunnlag={props.kravgrunnlag}
                medTittel={props.bareOppsummerMetaInfo.medTittel}
            />
        );
    } else if (props.basicOppsummeringAvHeleKravgrunnlaget) {
        return (
            <div>
                <OppsummeringAvMetaInfo
                    kravgrunnlag={props.kravgrunnlag}
                    medTittel={props.basicOppsummeringAvHeleKravgrunnlaget.medTittel}
                />
                <OppsummeringAvGrunnlagsperioderBasic grunnlagsperiode={props.kravgrunnlag.grunnlagsperiode} />
            </div>
        );
    } else if (props.oppsummeringMedPanel) {
        return (
            <Oppsummeringspanel
                ikon={props.oppsummeringMedPanel.ikon ?? Oppsummeringsikon.Task}
                farge={props.oppsummeringMedPanel.farge ?? Oppsummeringsfarge.Lilla}
                tittel={props.oppsummeringMedPanel.tittel ?? formatMessage('kravgrunnlag.utestående.tittel')}
                kompakt={props.kompakt}
            >
                <OppsummeringAvMetaInfo kravgrunnlag={props.kravgrunnlag} kompakt={props.kompakt} />
                <OppsummeringAvGrunnlagsPerioderAccordion
                    grunnlagsperiode={props.kravgrunnlag.grunnlagsperiode}
                    kompakt={props.kompakt}
                />
            </Oppsummeringspanel>
        );
    }

    return <div>teknisk feil bruk av oppsummering - må velge layout</div>;
};

const OppsummeringAvMetaInfo = (props: { kravgrunnlag: Kravgrunnlag; medTittel?: boolean; kompakt?: boolean }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            {props.medTittel && (
                <Heading className={styles.metaInfoTittel} size="medium">
                    {formatMessage('kravgrunnlag.utestående.tittel')}
                </Heading>
            )}

            <div
                className={classNames({
                    [styles.kravgrunnlagOppsummeringContainer]: !props.kompakt,
                    [styles.kravgrunnlagOppsummeringContainer_kompakt]: props.kompakt,
                })}
            >
                <OppsummeringPar
                    label={formatMessage('kravgrunnlag.id')}
                    verdi={props.kravgrunnlag.eksternKravgrunnlagsId}
                    retning="vertikal"
                    textSomSmall={props.kompakt}
                />

                <OppsummeringPar
                    label={formatMessage('kravgrunnlag.vedtakId')}
                    verdi={props.kravgrunnlag.eksternVedtakId}
                    retning="vertikal"
                    textSomSmall={props.kompakt}
                />
                <OppsummeringPar
                    label={formatMessage('kravgrunnlag.status')}
                    verdi={props.kravgrunnlag.status}
                    retning="vertikal"
                    textSomSmall={props.kompakt}
                />
                <OppsummeringPar
                    label={formatMessage('kravgrunnlag.kontrollfelt')}
                    verdi={props.kravgrunnlag.kontrollfelt}
                    retning="vertikal"
                    textSomSmall={props.kompakt}
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
                <div
                    key={`${periode.periode.fraOgMed}-${periode.periode.tilOgMed}`}
                    className={styles.grunnlagsbeløpContainer}
                >
                    <div className={styles.periodeMedBeløpContainer}>
                        <div>
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
                        <hr></hr>
                    </div>

                    <OppsummeringPar
                        label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.skatteProsent')}
                        verdi={periode.ytelse.skatteProsent}
                        retning="vertikal"
                    />

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

                    <OppsummeringPar
                        label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.nettoBeløp')}
                        verdi={periode.ytelse.nettoBeløp}
                        retning="vertikal"
                    />
                </div>
            ))}
        </div>
    );
};

const OppsummeringAvGrunnlagsPerioderAccordion = (props: {
    grunnlagsperiode: Grunnlagsperiode[];
    kompakt?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Heading size={props.kompakt ? 'xsmall' : 'small'}>
                {formatMessage('kravgrunnlag.grunnlagsperiode.tittel')}
            </Heading>

            <Accordion
                variant="neutral"
                headingSize={props.kompakt ? 'xsmall' : undefined}
                size={props.kompakt ? 'small' : undefined}
            >
                {props.grunnlagsperiode.map((periode) => (
                    <AccordionItem key={`${periode.periode.fraOgMed}-${periode.periode.tilOgMed}`}>
                        <Accordion.Header>
                            {`${formatMonthYear(periode.periode.fraOgMed)} - ${formatMonthYear(
                                periode.periode.tilOgMed,
                            )}`}
                        </Accordion.Header>

                        <Accordion.Content className={styles.grunnlagsbeløpContainer_kompakt}>
                            <div className={styles.lol}>
                                <OppsummeringPar
                                    label={formatMessage('kravgrunnlag.grunnlagsperiode.beløpSkattMnd')}
                                    verdi={periode.beløpSkattMnd}
                                    retning="vertikal"
                                    textSomSmall={props.kompakt}
                                />
                                <hr></hr>
                            </div>
                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.skatteProsent')}
                                verdi={periode.ytelse.skatteProsent}
                                retning="vertikal"
                                textSomSmall={props.kompakt}
                            />

                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.beløpNyUtbetaling')}
                                verdi={periode.ytelse.beløpNyUtbetaling}
                                retning="vertikal"
                                textSomSmall={props.kompakt}
                            />
                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.beløpTidligereUtbetaling')}
                                verdi={periode.ytelse.beløpTidligereUtbetaling}
                                retning="vertikal"
                                textSomSmall={props.kompakt}
                            />

                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.beløpSkalTilbakekreves')}
                                verdi={periode.ytelse.beløpSkalTilbakekreves}
                                retning="vertikal"
                                textSomSmall={props.kompakt}
                            />
                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.beløpSkalIkkeTilbakekreves')}
                                verdi={periode.ytelse.beløpSkalIkkeTilbakekreves}
                                retning="vertikal"
                                textSomSmall={props.kompakt}
                            />

                            <OppsummeringPar
                                label={formatMessage('kravgrunnlag.grunnlagsperiode.beløp.nettoBeløp')}
                                verdi={periode.ytelse.nettoBeløp}
                                retning="vertikal"
                                textSomSmall={props.kompakt}
                            />
                        </Accordion.Content>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default OppsummeringAvKravgrunnlag;
