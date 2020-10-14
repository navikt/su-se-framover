import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import { Element } from 'nav-frontend-typografi';
import React from 'react';

import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import messages from '~pages/saksbehandling/steg/beregning/beregning-nb';
import { Beregning } from '~types/Beregning';
import { Fradragstype, Fradrag } from '~types/Fradrag';

import { groupMånedsberegninger } from '../../delt/arrayUtils';
import { InfoLinje } from '../../delt/Infolinje/Infolinje';

import styles from './visBeregning.module.less';

interface Props {
    beregning: Beregning;
    forventetinntekt: number;
}

const fradragMedDenHøyesteAvArbeidsinntektOgForventetinntekt = (
    fradrag: Fradrag[],
    forventetinntekt: number
): Fradrag[] => {
    const { left: fradragUtenomArbeidsinntekt, right: arbeidsinntekt } = pipe(
        fradrag,
        arr.partition((f) => f.type === Fradragstype.Arbeidsinntekt)
    );
    const totalArbeidsinntekt = arbeidsinntekt.reduce((acc, currentInntekt) => acc + currentInntekt.beløp, 0);

    if (totalArbeidsinntekt >= forventetinntekt) {
        return fradrag;
    }

    return fradragUtenomArbeidsinntekt;
};

const VisBeregning = (props: Props) => {
    const intl = useI18n({ messages });
    const { beregning } = props;
    const totalbeløp = beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0);
    const gruppertMånedsberegninger = groupMånedsberegninger(beregning.månedsberegninger);
    const fradrag = fradragMedDenHøyesteAvArbeidsinntektOgForventetinntekt(beregning.fradrag, props.forventetinntekt);

    return (
        <div>
            {fradrag.length > 0 && (
                <div>
                    <Element className={styles.fradragHeading}>Fradrag:</Element>
                    <ul>
                        {fradrag.map((f, idx) => (
                            <li key={idx} className={styles.fradragItem}>
                                <InfoLinje
                                    tittel={f.utenlandskInntekt ? `Utenlandsk ${f.type}` : f.type}
                                    value={intl.formatNumber(f.beløp, { currency: 'NOK' })}
                                />
                                {f.utenlandskInntekt && (
                                    <div>
                                        <InfoLinje
                                            tittel={intl.formatMessage({
                                                id: 'display.visBeregning.beløpIUtenlandskValuta',
                                            })}
                                            value={intl.formatNumber(f.utenlandskInntekt.beløpIUtenlandskValuta, {
                                                currency: 'NOK',
                                            })}
                                        />
                                        <InfoLinje
                                            tittel={intl.formatMessage({
                                                id: 'display.visBeregning.valuta',
                                            })}
                                            value={f.utenlandskInntekt.valuta}
                                        />
                                        <InfoLinje
                                            tittel={intl.formatMessage({
                                                id: 'display.visBeregning.kurs',
                                            })}
                                            value={intl.formatNumber(f.utenlandskInntekt.kurs, {
                                                currency: 'NOK',
                                            })}
                                        />
                                    </div>
                                )}
                                {f.inntektDelerAvPeriode && (
                                    <div>
                                        <InfoLinje
                                            tittel="Fra og med"
                                            value={intl.formatDate(f.inntektDelerAvPeriode.fraOgMed)}
                                        />
                                        <InfoLinje
                                            tittel="Til og med"
                                            value={intl.formatDate(f.inntektDelerAvPeriode.tilOgMed)}
                                        />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <table className="tabell">
                <thead>
                    <tr>
                        <th>{intl.formatMessage({ id: 'utbetaling.tabellheader.periode' })}</th>
                        <th>{intl.formatMessage({ id: 'utbetaling.tabellheader.beløp' })}</th>
                        <th>{intl.formatMessage({ id: 'utbetaling.tabellheader.grunnbeløp' })}</th>
                    </tr>
                </thead>
                <tbody>
                    {gruppertMånedsberegninger.map((gruppe) => {
                        return pipe(
                            combineOptions(arr.head(gruppe), arr.last(gruppe)),
                            Option.fold(
                                () => null,
                                ([head, last]) => (
                                    <tr key={head.id + last.id}>
                                        <td>{`${intl.formatDate(head.fom)} - ${intl.formatDate(last.tom)}`}</td>
                                        <td>{head.beløp}</td>
                                        <td>{head.grunnbeløp}</td>
                                    </tr>
                                )
                            )
                        );
                    })}
                </tbody>
            </table>
            <p className={styles.totalBeløp}>Totalbeløp: {intl.formatNumber(totalbeløp)},-</p>
        </div>
    );
};
export default VisBeregning;
