import classNames from 'classnames';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import * as Ord from 'fp-ts/Ord';
import { Element, Normaltekst, Systemtittel, Undertekst } from 'nav-frontend-typografi';
import React from 'react';

import { groupBy, groupByEq } from '~lib/arrayUtils';
import { formatMonthYear } from '~lib/dateUtils';
import { formatCurrency } from '~lib/formatUtils';
import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import messages from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregning-nb';
import { Beregning, eqMånedsberegningBortsettFraPeriode, Månedsberegning } from '~types/Beregning';
import { Fradrag, Fradragstype } from '~types/Fradrag';
import { Sats } from '~types/Sats';

import * as BeregningUtils from './beregningUtils';
import styles from './visBeregning.module.less';

interface Props {
    beregningsTittel?: string;
    beregning: Beregning;
}

const getFradragsnøkkel = (f: Fradrag) =>
    [f.type, f.utenlandskInntekt?.kurs ?? '', f.utenlandskInntekt?.valuta ?? '', f.tilhører].join('-');

const getBenyttedeFradrag = (månedsberegning: Månedsberegning): Fradrag[] =>
    pipe(
        månedsberegning.fradrag,
        (fradrag) => groupBy(fradrag, getFradragsnøkkel),
        (grupperteFradrag) =>
            Object.values(grupperteFradrag).map<Fradrag>((fradrag) => ({
                beløp: fradrag.reduce((acc, f) => acc + f.beløp, 0),
                type: fradrag[0].type,
                tilhører: fradrag[0].tilhører,
                utenlandskInntekt: fradrag[0].utenlandskInntekt,
                periode: fradrag[0].periode,
            }))
    );

const DetaljertFradrag = (props: {
    tittel: {
        label: string;
        verdi: string;
    };
    detaljer: Array<{ label: string; verdi: string; epsUtland?: boolean }>;
}) => (
    <div className={styles.detaljertfradrag}>
        <Normaltekst className={styles.linje}>
            <span>{props.tittel.label}</span>
            <span>{props.tittel.verdi}</span>
        </Normaltekst>
        <ul className={styles.detaljertFradragliste}>
            {props.detaljer.map((d) => (
                <li key={d.label} className={d.epsUtland ? styles.linjeEpsUtland : styles.linje}>
                    <Undertekst>{d.label}</Undertekst>
                    <Undertekst>{d.verdi}</Undertekst>
                </li>
            ))}
        </ul>
    </div>
);

const VisBeregning = (props: Props) => {
    const intl = useI18n({ messages });

    return (
        <div className={styles.beregningdetaljer}>
            <Systemtittel className={styles.visBeregningTittel}>
                {props.beregningsTittel ? props.beregningsTittel : intl.formatMessage({ id: 'page.tittel' })}
            </Systemtittel>
            <Element className={classNames(styles.totalt, styles.linje)}>
                <span>{intl.formatMessage({ id: 'display.totaltBeløp' })}</span>
                <span>
                    {formatCurrency(
                        intl,
                        props.beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0),
                        {
                            numDecimals: 0,
                        }
                    )}
                </span>
            </Element>
            {pipe(
                props.beregning.månedsberegninger,
                groupByEq(eqMånedsberegningBortsettFraPeriode),
                arr.map((månedsberegninger) => (
                    <div key={månedsberegninger[0].fraOgMed}>
                        {pipe(
                            combineOptions(arr.head(månedsberegninger), arr.last(månedsberegninger)),
                            Option.fold(
                                () => ({
                                    tittel: '?',
                                    beløp: 0,
                                }),
                                ([head, last]) => ({
                                    tittel: `${formatMonthYear(head.fraOgMed, intl)} - ${formatMonthYear(
                                        last.tilOgMed,
                                        intl
                                    )}`,
                                    beløp: head.beløp,
                                })
                            ),
                            ({ tittel, beløp }) => (
                                <Element tag="h3" className={classNames(styles.periodeoverskrift, styles.linje)}>
                                    <span>{tittel}</span>
                                    <span>
                                        {formatCurrency(intl, beløp, {
                                            numDecimals: 0,
                                        })}{' '}
                                        i mnd
                                    </span>
                                </Element>
                            )
                        )}

                        <ol className={styles.fradragliste}>
                            <li className={styles.linje}>
                                <span>
                                    {intl.formatMessage({
                                        id:
                                            månedsberegninger[0].sats === Sats.Høy
                                                ? 'display.visBeregning.sats.høy'
                                                : 'display.visBeregning.sats.ordinær',
                                    })}
                                </span>
                                <span>{formatCurrency(intl, månedsberegninger[0].satsbeløp)}</span>
                            </li>
                            {pipe(
                                månedsberegninger[0],
                                getBenyttedeFradrag,
                                arr.sortBy([
                                    Ord.ord.contramap(Ord.ordString, (f: Fradrag) => f.tilhører),
                                    Ord.ord.contramap(Ord.ordString, (f: Fradrag) => f.type),
                                ]),
                                arr.map((fradrag) => (
                                    <li key={getFradragsnøkkel(fradrag)} className={styles.linje}>
                                        {fradrag.type === Fradragstype.BeregnetFradragEPS ? (
                                            <DetaljertFradrag
                                                tittel={{
                                                    label: intl.formatMessage({
                                                        id: BeregningUtils.fradragstypeResourceId(fradrag.type),
                                                    }),
                                                    verdi: formatCurrency(intl, -fradrag.beløp),
                                                }}
                                                detaljer={[
                                                    ...månedsberegninger[0].epsInputFradrag.flatMap((f) => {
                                                        if (!f.utenlandskInntekt) {
                                                            return {
                                                                label: intl.formatMessage({
                                                                    id: BeregningUtils.fradragstypeResourceId(f.type),
                                                                }),
                                                                verdi: formatCurrency(intl, -f.beløp),
                                                            };
                                                        }
                                                        return [
                                                            {
                                                                label: intl.formatMessage({
                                                                    id: BeregningUtils.fradragstypeResourceId(f.type),
                                                                }),
                                                                verdi: formatCurrency(intl, -f.beløp),
                                                            },
                                                            {
                                                                label: intl.formatMessage({
                                                                    id: 'fradrag.utenlandsk.beløp',
                                                                }),
                                                                verdi: formatCurrency(
                                                                    intl,
                                                                    f.utenlandskInntekt.beløpIUtenlandskValuta,
                                                                    {
                                                                        currency: f.utenlandskInntekt.valuta,
                                                                    }
                                                                ),
                                                                epsUtland: true,
                                                            },
                                                            {
                                                                label: intl.formatMessage({
                                                                    id: 'fradrag.utenlandsk.kurs',
                                                                }),
                                                                verdi: intl.formatNumber(f.utenlandskInntekt.kurs),
                                                                epsUtland: true,
                                                            },
                                                        ];
                                                    }),
                                                    {
                                                        label: intl.formatMessage({
                                                            id: 'fradrag.eps.fribeløp',
                                                        }),
                                                        verdi: formatCurrency(intl, månedsberegninger[0].epsFribeløp),
                                                    },
                                                ]}
                                            />
                                        ) : fradrag.utenlandskInntekt !== null ? (
                                            <DetaljertFradrag
                                                tittel={{
                                                    label: intl.formatMessage({
                                                        id: BeregningUtils.fradragstypeResourceId(fradrag.type),
                                                    }),
                                                    verdi: formatCurrency(intl, -fradrag.beløp),
                                                }}
                                                detaljer={[
                                                    {
                                                        label: intl.formatMessage({
                                                            id: 'fradrag.utenlandsk.beløp',
                                                        }),
                                                        verdi: formatCurrency(
                                                            intl,
                                                            fradrag.utenlandskInntekt.beløpIUtenlandskValuta,
                                                            {
                                                                currency: fradrag.utenlandskInntekt.valuta,
                                                            }
                                                        ),
                                                    },
                                                    {
                                                        label: intl.formatMessage({ id: 'fradrag.utenlandsk.kurs' }),
                                                        verdi: intl.formatNumber(fradrag.utenlandskInntekt.kurs),
                                                    },
                                                ]}
                                            />
                                        ) : (
                                            <>
                                                <span>
                                                    {intl.formatMessage({
                                                        id: BeregningUtils.fradragstypeResourceId(fradrag.type),
                                                    })}
                                                </span>
                                                <span>{formatCurrency(intl, -fradrag.beløp)}</span>
                                            </>
                                        )}
                                    </li>
                                ))
                            )}
                        </ol>
                    </div>
                ))
            )}
        </div>
    );
};
export default VisBeregning;
