import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import { Element } from 'nav-frontend-typografi';
import React from 'react';

import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import messages from '~pages/saksbehandling/steg/beregning/beregning-nb';
import { Beregning } from '~types/Beregning';
import { Fradragstype, Fradrag, ForventetInntektfradrag } from '~types/Fradrag';

import { groupMånedsberegninger } from '../../delt/arrayUtils';
import { InfoLinje } from '../../delt/Infolinje/Infolinje';

import styles from './visBeregning.module.less';

interface Props {
    beregning: Beregning;
    forventetinntekt: number;
}

const Utenlandsk = 'Utenlandsk';

const fradragMedForventetinntekt = (fradrag: Fradrag[], forventetinntekt: number): Fradrag[] => {
    const { left: andreFradrag, right: arbeidsinntektfradrag } = pipe(
        fradrag,
        arr.partition((f) => f.type === Fradragstype.Arbeidsinntekt)
    );

    if (arbeidsinntektfradrag.reduce((acc, fradragEntry) => acc + fradragEntry.beløp, 0) >= forventetinntekt) {
        return fradrag;
    }

    return [
        ...andreFradrag,
        {
            type: ForventetInntektfradrag,
            beløp: forventetinntekt,
            utenlandskInntekt: null,
            delerAvPeriode: null,
        },
    ];
};

const VisBeregning = (props: Props) => {
    const intl = useI18n({ messages });
    const { beregning } = props;
    const totalbeløp = beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0);
    const gruppertMånedsberegninger = groupMånedsberegninger(beregning.månedsberegninger);

    return (
        <div>
            {fradragMedForventetinntekt(beregning.fradrag, props.forventetinntekt).length > 0 && (
                <div>
                    <Element className={styles.fradragHeading}>Fradrag:</Element>
                    <ul>
                        {fradragMedForventetinntekt(beregning.fradrag, props.forventetinntekt).map((f, idx) => (
                            <li key={idx} className={styles.fradragItem}>
                                <InfoLinje
                                    tittel={f.utenlandskInntekt ? `${Utenlandsk} ${f.type}` : f.type}
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
                                {f.delerAvPeriode && (
                                    <div>
                                        <InfoLinje
                                            tittel="Fra og med"
                                            value={intl.formatDate(f.delerAvPeriode.fraOgMed)}
                                        />
                                        <InfoLinje
                                            tittel="Til og med"
                                            value={intl.formatDate(f.delerAvPeriode.tilOgMed)}
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
                                        <td>{`${intl.formatDate(head.fraOgMed)} - ${intl.formatDate(
                                            last.tilOgMed
                                        )}`}</td>
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
