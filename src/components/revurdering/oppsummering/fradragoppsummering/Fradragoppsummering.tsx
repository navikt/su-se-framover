import { BodyShort, Label } from '@navikt/ds-react';
import * as A from 'fp-ts/Array';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import * as React from 'react';

import fradragstypeMessages from '~src/components/beregningOgSimulering/beregning/fradragInputs/fradragInputs-nb';
import { pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import { eqNullable } from '~src/lib/types';
import { Fradrag, FradragTilhører } from '~src/types/Fradrag';
import { eqStringPeriode } from '~src/types/Periode';
import { groupByEq } from '~src/utils/array/arrayUtils';
import * as DateUtils from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';

import messages from './fradragoppsummering-nb';
import * as styles from './fradragoppsummering.module.less';

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
                        <Label spacing>
                            {pipe(
                                A.head(fradragsgruppe),
                                O.chainNullableK((head) => head.periode),
                                O.map((periode) => DateUtils.formatPeriode(periode)),
                                O.getOrElse(() => formatMessage('feil.ukjent.periode'))
                            )}
                        </Label>

                        <BodyShort as="ul" className={styles.fradragliste}>
                            {fradragsgruppe.map((fradrag, idx) => (
                                <li key={idx} className={styles.linje}>
                                    <span>
                                        {`${intl.formatMessage({ id: fradrag.type })}${
                                            fradrag.tilhører === FradragTilhører.EPS
                                                ? ' ' + intl.formatMessage({ id: 'fradrag.suffix.eps' })
                                                : ''
                                        }`}
                                    </span>
                                    <span>{formatCurrency(fradrag.beløp)}</span>
                                    {fradrag.utenlandskInntekt !== null && (
                                        <>
                                            <BodyShort size="small" className={styles.detailedLinje}>
                                                {formatMessage('fradrag.utenlandsk.beløp')}
                                            </BodyShort>
                                            <BodyShort size="small">
                                                {formatCurrency(fradrag.utenlandskInntekt.beløpIUtenlandskValuta, {
                                                    currency: fradrag.utenlandskInntekt.valuta,
                                                })}
                                            </BodyShort>
                                            <BodyShort size="small" className={styles.detailedLinje}>
                                                {formatMessage('fradrag.utenlandsk.kurs')}
                                            </BodyShort>
                                            <BodyShort size="small">
                                                {intl.formatNumber(fradrag.utenlandskInntekt.kurs)}
                                            </BodyShort>
                                        </>
                                    )}
                                </li>
                            ))}
                        </BodyShort>
                    </li>
                ))
            )}
        </ul>
    );
};

export default Fradragoppsummering;
