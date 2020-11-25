import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import React from 'react';

import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import messages from '~pages/saksbehandling/steg/beregning/beregning-nb';
import { Beregning } from '~types/Beregning';
import { Fradrag } from '~types/Fradrag';
import { Sats } from '~types/Sats';

import { groupBy, groupMånedsberegninger } from '../../delt/arrayUtils';
import { InfoLinje } from '../../delt/Infolinje/Infolinje';

import * as BeregningUtils from './beregningUtils';
import styles from './visBeregning.module.less';

interface Props {
    beregning: Beregning;
    forventetinntekt: number;
}

const VisBeregning = (props: Props) => {
    const intl = useI18n({ messages });
    const { beregning } = props;
    const gruppertMånedsberegninger = groupMånedsberegninger(beregning.månedsberegninger);

    const fradragBenyttetIBeregning = beregning.månedsberegninger.flatMap((månedsberegning) => {
        return månedsberegning.fradrag;
    });

    const fradragGruppertEtterType = groupBy(fradragBenyttetIBeregning, (f) => f.type);

    const fradrag: Fradrag[] = Object.values(fradragGruppertEtterType).map((f) => {
        return {
            beløp: f.reduce((acc, val) => acc + val.beløp, 0),
            type: f[0].type,
            tilhører: f[0].tilhører,
            utenlandskInntekt: null,
        };
    });
    return (
        <div>
            {fradrag.length > 0 && (
                <div>
                    <InfoLinje
                        tittel={intl.formatMessage({
                            id:
                                beregning.sats === Sats.Høy
                                    ? 'display.visBeregning.sats.høy'
                                    : 'display.visBeregning.sats.ordinær',
                        })}
                        value={intl.formatNumber(
                            beregning.månedsberegninger.reduce((acc, val) => acc + val.satsbeløp, 0),
                            { currency: 'NOK' }
                        )}
                    />
                    <ul>
                        {fradrag.map((f, idx) => {
                            const fradragstype = intl.formatMessage({
                                id: BeregningUtils.fradragstypeResourceId(f.type),
                            });
                            return (
                                <li key={idx} className={styles.fradragItem}>
                                    <InfoLinje
                                        tittel={
                                            f.utenlandskInntekt
                                                ? `Utenlandsk ${fradragstype.toLowerCase()} ${f.tilhører}`
                                                : `${fradragstype} ${f.tilhører}`
                                        }
                                        value={`-${intl.formatNumber(f.beløp, { currency: 'NOK' })}`}
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
                                </li>
                            );
                        })}
                    </ul>
                    <InfoLinje
                        tittel="Totalbeløp (avrundet)"
                        value={intl.formatNumber(
                            beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0),
                            { currency: 'NOK' }
                        )}
                    />
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
                                    <tr key={head.fraOgMed + last.tilOgMed}>
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
        </div>
    );
};
export default VisBeregning;
