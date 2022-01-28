import { BodyShort, Label } from '@navikt/ds-react';
import * as A from 'fp-ts/Array';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import * as React from 'react';

import { pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import { eqNullable } from '~lib/types';
import { Fradrag, FradragTilhører } from '~types/Fradrag';
import { eqStringPeriode } from '~types/Periode';
import { groupByEq } from '~utils/array/arrayUtils';
import * as DateUtils from '~utils/date/dateUtils';
import { formatCurrency } from '~utils/format/formatUtils';
import fradragstypeMessages from '~utils/søknadsbehandling/fradrag/fradragstyper-nb';

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
                                            <BodyShort size="small" className={styles.alignTextRight}>
                                                {formatCurrency(fradrag.utenlandskInntekt.beløpIUtenlandskValuta, {
                                                    currency: fradrag.utenlandskInntekt.valuta,
                                                })}
                                            </BodyShort>
                                            <BodyShort size="small" className={styles.detailedLinje}>
                                                {formatMessage('fradrag.utenlandsk.kurs')}
                                            </BodyShort>
                                            <BodyShort size="small" className={styles.alignTextRight}>
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
