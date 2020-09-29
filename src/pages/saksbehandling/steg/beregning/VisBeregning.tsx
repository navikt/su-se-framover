import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import { Element } from 'nav-frontend-typografi';
import React from 'react';

import messages from '~/features/beregning/beregning-nb';
import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Beregning } from '~types/Beregning';

import { groupMånedsberegninger } from '../../delt/arrayUtils';
import { InfoLinje } from '../../delt/Infolinje/Infolinje';

import styles from './visBeregning.module.less';

interface Props {
    beregning: Beregning;
}

const VisBeregning = (props: Props) => {
    const intl = useI18n({ messages });
    const { beregning } = props;
    const totalbeløp = beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0);
    const gruppertMånedsberegninger = groupMånedsberegninger(beregning.månedsberegninger);

    return (
        <div>
            {beregning.fradrag.length > 0 && (
                <div>
                    <Element className={styles.fradragHeading}>Fradrag:</Element>
                    <ul>
                        {beregning.fradrag.map((f, idx) => (
                            <li key={idx} className={styles.fradragItem}>
                                <InfoLinje tittel={f.type} value={intl.formatNumber(f.beløp, { currency: 'NOK' })} />
                                {f.fraUtlandInntekt && (
                                    <div>
                                        <InfoLinje
                                            tittel={intl.formatMessage({
                                                id: 'display.visBeregning.beløpUtenlandskValuta',
                                            })}
                                            //på grunn av annerledes typing på front-end og back-end, så har verdiene her
                                            //en default, selv om den sjekkes på f.fraUtlandInntekt
                                            value={intl.formatNumber(f.fraUtlandInntekt.beløpUtenlandskValuta ?? 0, {
                                                currency: 'NOK',
                                            })}
                                        />
                                        <InfoLinje
                                            tittel={intl.formatMessage({
                                                id: 'display.visBeregning.valuta',
                                            })}
                                            value={f.fraUtlandInntekt.valuta ?? ''}
                                        />
                                        <InfoLinje
                                            tittel={intl.formatMessage({
                                                id: 'display.visBeregning.kurs',
                                            })}
                                            value={intl.formatNumber(f.fraUtlandInntekt.kurs ?? 0, {
                                                currency: 'NOK',
                                            })}
                                        />
                                    </div>
                                )}
                                {f.delerAvPeriode && (
                                    <div>
                                        <InfoLinje
                                            tittel="Fra og med"
                                            value={f.delerAvPeriode.fraOgMed?.toString() ?? ''}
                                        />
                                        <InfoLinje
                                            tittel="Til og med"
                                            value={f.delerAvPeriode.tilOgMed?.toString() ?? ''}
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
