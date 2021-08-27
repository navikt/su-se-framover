import * as A from 'fp-ts/Array';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Undertekst, Element } from 'nav-frontend-typografi';
import * as React from 'react';

import { pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import { eqNullable } from '~lib/types';
import { Fradrag } from '~types/Fradrag';
import { eqStringPeriode } from '~types/Periode';
import { groupByEq } from '~utils/array/arrayUtils';
import * as DateUtils from '~utils/date/dateUtils';
import { formatCurrency } from '~utils/format/formatUtils';
import fradragstypeMessages from '~utils/søknadsbehandling/fradrag/fradragstyper-nb';
import { getFradragstypeStringMedEpsSpesifisering } from '~utils/søknadsbehandling/fradrag/fradragUtils';

import messages from './fradragoppsummering-nb';
import styles from './fradragoppsummering.module.less';

const Fradragoppsummering = (props: { fradrag: Fradrag[] }) => {
    const { intl, formatMessage } = useI18n({ messages: { ...messages, ...fradragstypeMessages } });
    return (
        <ul className={styles.periodeliste}>
            {pipe(
                props.fradrag,
                groupByEq(
                    pipe(
                        eqNullable(eqStringPeriode),
                        Eq.contramap((f) => f.periode)
                    )
                ),
                A.mapWithIndex((index, fradragsgruppe) => (
                    <li key={index}>
                        <Element className={styles.fradragperiodeHeader}>
                            {pipe(
                                A.head(fradragsgruppe),
                                O.chainNullableK((head) => head.periode),
                                O.map((periode) => DateUtils.formatPeriode(periode)),
                                O.getOrElse(() => formatMessage('feil.ukjent.periode'))
                            )}
                        </Element>

                        <ul className={styles.fradragliste}>
                            {fradragsgruppe.map((fradrag, idx) => (
                                <li key={idx} className={styles.linje}>
                                    <span>
                                        {getFradragstypeStringMedEpsSpesifisering(fradrag.type, fradrag.tilhører, intl)}
                                    </span>
                                    <span>{formatCurrency(fradrag.beløp)}</span>
                                    {fradrag.utenlandskInntekt !== null && (
                                        <>
                                            <Undertekst className={styles.detailedLinje}>
                                                {formatMessage('fradrag.utenlandsk.beløp')}
                                            </Undertekst>
                                            <Undertekst className={styles.alignTextRight}>
                                                {formatCurrency(fradrag.utenlandskInntekt.beløpIUtenlandskValuta, {
                                                    currency: fradrag.utenlandskInntekt.valuta,
                                                })}
                                            </Undertekst>
                                            <Undertekst className={styles.detailedLinje}>
                                                {formatMessage('fradrag.utenlandsk.kurs')}
                                            </Undertekst>
                                            <Undertekst className={styles.alignTextRight}>
                                                {intl.formatNumber(fradrag.utenlandskInntekt.kurs)}
                                            </Undertekst>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))
            )}
        </ul>
    );
};

export default Fradragoppsummering;
