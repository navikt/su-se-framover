import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import { Element, Undertekst } from 'nav-frontend-typografi';
import React from 'react';
import { IntlShape } from 'react-intl';

import messages from '~/features/beregning/beregning-nb';
import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Beregning } from '~types/Beregning';
import { Fradragstype, Fradrag, ForventetInntektfradrag } from '~types/Fradrag';

import { groupMånedsberegninger } from '../delt/arrayUtils';
import { InfoLinje } from '../delt/Infolinje/Infolinje';

import styles from './visBeregning.module.less';

interface Props {
    beregning: Beregning;
    forventetinntekt: number;
}

const fradragMedForventetinntekt = (
    fragdragsArray: Array<Fradrag>,
    forventetinntekt: number,
    intl: IntlShape
): Array<Fradrag> => {
    const totalArbeidsinntekt = fragdragsArray
        .filter((f) => f.type === Fradragstype.Arbeidsinntekt)
        .reduce((acc, arbeidsfradrag) => acc + arbeidsfradrag.beløp, 0);
    const andreFradrag = fragdragsArray.filter((f) => f.type !== Fradragstype.Arbeidsinntekt);

    if (totalArbeidsinntekt >= forventetinntekt) {
        return fragdragsArray;
    }

    andreFradrag.push({
        type: ForventetInntektfradrag,
        beløp: forventetinntekt,
        beskrivelse: intl.formatMessage({ id: 'display.brukerForventetinntekt' }),
    });
    return andreFradrag;
};

const VisBeregning = (props: Props) => {
    const intl = useI18n({ messages });
    const { beregning } = props;
    const totalbeløp = beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0);
    const gruppertMånedsberegninger = groupMånedsberegninger(beregning.månedsberegninger);

    return (
        <div>
            {fradragMedForventetinntekt(beregning.fradrag, props.forventetinntekt, intl).length > 0 && (
                <div>
                    <Element className={styles.fradragHeading}>Fradrag:</Element>
                    <ul>
                        {fradragMedForventetinntekt(beregning.fradrag, props.forventetinntekt, intl).map((f, idx) => (
                            <li key={idx} className={styles.fradragItem}>
                                <InfoLinje tittel={f.type} value={intl.formatNumber(f.beløp, { currency: 'NOK' })} />
                                {f.beskrivelse && (
                                    <Undertekst className={styles.fradragKommentar}>{f.beskrivelse}</Undertekst>
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
