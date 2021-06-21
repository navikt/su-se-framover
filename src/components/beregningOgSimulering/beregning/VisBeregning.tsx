import classNames from 'classnames';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import { Element, Systemtittel, Undertekst } from 'nav-frontend-typografi';
import React from 'react';
import { IntlShape } from 'react-intl';

import messages from '~components/beregningOgSimulering/beregning/beregning-nb';
import fradragstypeMessages from '~features/fradrag/fradragstyper-nb';
import { getFradragstypeString } from '~features/fradrag/fradragUtils';
import { groupBy, groupByEq } from '~lib/arrayUtils';
import { formatMonthYear } from '~lib/dateUtils';
import { formatCurrency } from '~lib/formatUtils';
import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Beregning, eqMånedsberegningBortsettFraPeriode, Månedsberegning } from '~types/Beregning';
import { Fradrag, Fradragstype } from '~types/Fradrag';
import { Sats } from '~types/Sats';

import styles from './visBeregning.module.less';

interface Props {
    beregningsTittel?: string;
    utenTittel?: boolean;
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
    <>
        <span>{props.tittel.label}</span>
        <span className={styles.alignTextRight}>{props.tittel.verdi}</span>
        <>
            {props.detaljer.map((d, index) => (
                <React.Fragment key={d.label + index}>
                    <Undertekst className={d.epsUtland ? styles.additionalDetails : styles.detailedLinje}>
                        {d.label}
                    </Undertekst>
                    <Undertekst className={styles.alignTextRight}>{d.verdi}</Undertekst>
                </React.Fragment>
            ))}
        </>
    </>
);

const VisBenyttetEpsFradrag = ({
    fradrag,
    epsInputFradrag,
    epsFribeløp,
    intl,
}: {
    fradrag: Fradrag;
    intl: IntlShape;
    epsInputFradrag: Fradrag[];
    epsFribeløp: number;
}) => (
    // Hvis denne finns så eksisterer det fradrag for EPS i aktuell måned
    <DetaljertFradrag
        tittel={{
            label: getFradragstypeString(fradrag.type, intl),
            verdi: formatCurrency(intl, -fradrag.beløp),
        }}
        detaljer={[
            ...epsInputFradrag.flatMap((f) => {
                if (!f.utenlandskInntekt) {
                    return {
                        label: getFradragstypeString(f.type, intl),
                        verdi: formatCurrency(intl, -f.beløp),
                    };
                }
                return [
                    {
                        label: getFradragstypeString(f.type, intl),
                        verdi: formatCurrency(intl, -f.beløp),
                    },
                    {
                        label: intl.formatMessage({
                            id: 'fradrag.utenlandsk.beløp',
                        }),
                        verdi: formatCurrency(intl, f.utenlandskInntekt.beløpIUtenlandskValuta, {
                            currency: f.utenlandskInntekt.valuta,
                        }),
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
                verdi: formatCurrency(intl, epsFribeløp),
            },
        ]}
    />
);

const VisBeregning = (props: Props) => {
    const intl = useI18n({ messages: { ...messages, ...fradragstypeMessages } });

    return (
        <div className={styles.beregningdetaljer}>
            {!props.utenTittel && (
                <Systemtittel className={styles.visBeregningTittel}>
                    {props.beregningsTittel ? props.beregningsTittel : intl.formatMessage({ id: 'page.tittel' })}
                </Systemtittel>
            )}
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
                arr.mapWithIndex((index, månedsberegninger) => (
                    <div key={månedsberegninger[0].fraOgMed}>
                        {pipe(
                            combineOptions([arr.head(månedsberegninger), arr.last(månedsberegninger)]),
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
                                    pipe(
                                        S.Ord,
                                        Ord.contramap((f: Fradrag) => f.tilhører)
                                    ),
                                    pipe(
                                        S.Ord,
                                        Ord.contramap((f: Fradrag) => f.type)
                                    ),
                                ]),
                                arr.map((fradrag) => (
                                    <li key={getFradragsnøkkel(fradrag) + index} className={styles.linje}>
                                        {fradrag.type === Fradragstype.BeregnetFradragEPS ? (
                                            <VisBenyttetEpsFradrag
                                                fradrag={fradrag}
                                                epsInputFradrag={månedsberegninger[0].epsInputFradrag}
                                                epsFribeløp={månedsberegninger[0].epsFribeløp}
                                                intl={intl}
                                            />
                                        ) : fradrag.utenlandskInntekt !== null ? (
                                            <DetaljertFradrag
                                                tittel={{
                                                    label: getFradragstypeString(fradrag.type, intl),
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
                                                <span>{getFradragstypeString(fradrag.type, intl)}</span>
                                                <span>{formatCurrency(intl, -fradrag.beløp)}</span>
                                            </>
                                        )}
                                    </li>
                                ))
                            )}
                            {pipe(månedsberegninger[0], getBenyttedeFradrag, (benyttedeFradrag) => {
                                return (
                                    månedsberegninger[0].epsInputFradrag.length === 0 ||
                                    benyttedeFradrag.some((fradrag) => fradrag.type === Fradragstype.BeregnetFradragEPS) // Beregnet fradrag er når det er over fribeløp
                                );
                            }) ? null : (
                                // TODO ai 30.04.2021: determine key for list of fradrag for eps
                                <li key={Math.random()} className={styles.linje}>
                                    <DetaljertFradrag
                                        tittel={{
                                            label:
                                                getFradragstypeString(Fradragstype.BeregnetFradragEPS, intl) +
                                                ' (lavere enn fribeløp, ikke inkludert)',
                                            verdi: formatCurrency(intl, 0),
                                        }}
                                        detaljer={[
                                            ...månedsberegninger[0].epsInputFradrag.flatMap((f) => {
                                                if (!f.utenlandskInntekt) {
                                                    return {
                                                        label: getFradragstypeString(f.type, intl),
                                                        verdi: formatCurrency(intl, -f.beløp),
                                                    };
                                                }
                                                return [
                                                    {
                                                        label: getFradragstypeString(f.type, intl),
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
                                </li>
                            )}
                        </ol>
                    </div>
                ))
            )}
        </div>
    );
};
export default VisBeregning;
