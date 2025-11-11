import { Label } from '@navikt/ds-react';
import * as A from 'fp-ts/Array';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';

import { pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import { eqNullable } from '~src/lib/types';
import { Fradrag, FradragTilhører, UtenlandskInntekt } from '~src/types/Fradrag';
import { eqStringPeriode } from '~src/types/Periode';
import { groupByEq } from '~src/utils/array/arrayUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';
import { formatPeriode } from '~src/utils/periode/periodeUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';
import messages from './oppsummeringAvVilkårOgGrunnlag-nb';

const OppsummeringAvFradrag = (props: { fradrag: Fradrag[] }) => {
    const { formatMessage } = useI18n({ messages });

    if (props.fradrag.length === 0) {
        return (
            <div>
                <Label>{formatMessage('fradrag.ingenFradrag')}</Label>
            </div>
        );
    }

    return (
        <ul>
            {pipe(
                props.fradrag,
                groupByEq(
                    pipe(
                        eqNullable(eqStringPeriode),
                        Eq.contramap((f) => f.periode),
                    ),
                ),
                A.mapWithIndex((index, fradragsgruppe) => (
                    <li key={index} className={styles.grunnlagsListe}>
                        <OppsummeringPar
                            label={formatMessage('periode')}
                            verdi={pipe(
                                A.head(fradragsgruppe),
                                O.chainNullableK((head) => head.periode),
                                O.map((periode) => formatPeriode(periode)),
                                O.getOrElse(() => formatMessage('feil.ukjent.periode')),
                            )}
                        />

                        <ul className={styles.grunnlagsListe}>
                            {fradragsgruppe.map((fradrag, idx) => (
                                <li key={idx}>
                                    <OppsummeringPar
                                        label={`${formatMessage(fradrag.type)}${
                                            fradrag.tilhører === FradragTilhører.EPS
                                                ? ' ' + formatMessage('fradrag.suffix.eps')
                                                : ''
                                        }`}
                                        verdi={formatCurrency(fradrag.beløp)}
                                    />
                                    {fradrag.utenlandskInntekt !== null && (
                                        <UtenlandsinntektOppsummering utenlandsinntekt={fradrag.utenlandskInntekt} />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </li>
                )),
            )}
        </ul>
    );
};

export default OppsummeringAvFradrag;

const UtenlandsinntektOppsummering = (props: { utenlandsinntekt: UtenlandskInntekt }) => {
    const { formatMessage, intl } = useI18n({ messages });
    return (
        <div className={styles.utenlandsinntektContainer}>
            <OppsummeringPar
                label={formatMessage('fradrag.utenlandsk.beløp')}
                verdi={formatCurrency(props.utenlandsinntekt.beløpIUtenlandskValuta, {
                    currency: props.utenlandsinntekt.valuta,
                })}
                textSomSmall
            />
            <OppsummeringPar
                label={formatMessage('fradrag.utenlandsk.kurs')}
                verdi={intl.formatNumber(props.utenlandsinntekt.kurs)}
                textSomSmall
            />
        </div>
    );
};
