import * as A from 'fp-ts/Array';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Undertekst, Element } from 'nav-frontend-typografi';
import * as React from 'react';

import fradragstypeMessages from '~features/fradrag/fradragstyper-nb';
import { getFradragstypeStringMedEpsSpesifisering } from '~features/fradrag/fradragUtils';
import { groupByEq } from '~lib/arrayUtils';
import * as DateUtils from '~lib/dateUtils';
import { formatCurrency } from '~lib/formatUtils';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { eqNullable } from '~lib/types';
import { Fradrag } from '~types/Fradrag';
import { eqStringPeriode } from '~types/Periode';

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
                A.mapWithIndex((idx, fradragsgruppe) => (
                    <li key={idx}>
                        <Element className={styles.fradragperiodeHeader}>
                            {pipe(
                                A.head(fradragsgruppe),
                                O.chainNullableK((head) => head.periode),
                                O.map((periode) => DateUtils.formatPeriode(periode, intl)),
                                O.getOrElse(() => formatMessage('feil.ukjent.periode'))
                            )}
                        </Element>

                        <ul className={styles.fradragliste}>
                            {fradragsgruppe.map((fradrag, idx) => (
                                <li key={idx} className={styles.linje}>
                                    <span>
                                        {getFradragstypeStringMedEpsSpesifisering(fradrag.type, fradrag.tilhører, intl)}
                                    </span>
                                    <span>{formatCurrency(intl, fradrag.beløp)}</span>
                                    {fradrag.utenlandskInntekt !== null && (
                                        <>
                                            <Undertekst className={styles.detailedLinje}>
                                                {formatMessage('fradrag.utenlandsk.beløp')}
                                            </Undertekst>
                                            <Undertekst className={styles.alignTextRight}>
                                                {formatCurrency(
                                                    intl,
                                                    fradrag.utenlandskInntekt.beløpIUtenlandskValuta,
                                                    {
                                                        currency: fradrag.utenlandskInntekt.valuta,
                                                    }
                                                )}
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
