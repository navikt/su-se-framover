import { BodyShort, Heading, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import React from 'react';
import { IntlShape } from 'react-intl';

import messages from '~components/beregningOgSimulering/beregning/beregning-nb';
import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import { Beregning, eqMånedsberegningBortsettFraPeriode, Månedsberegning } from '~types/Beregning';
import { Fradrag, Fradragstype } from '~types/Fradrag';
import { Sats } from '~types/Sats';
import { groupBy, groupByEq } from '~utils/array/arrayUtils';
import { formatMonthYear } from '~utils/date/dateUtils';
import { formatCurrency } from '~utils/format/formatUtils';
import fradragstypeMessages from '~utils/søknadsbehandling/fradrag/fradragstyper-nb';
import { getFradragstypeString } from '~utils/søknadsbehandling/fradrag/fradragUtils';

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
                    <BodyShort size="small" className={d.epsUtland ? styles.additionalDetails : styles.detailedLinje}>
                        {d.label}
                    </BodyShort>
                    <BodyShort size="small" className={styles.alignTextRight}>
                        {d.verdi}
                    </BodyShort>
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
            verdi: formatCurrency(-fradrag.beløp),
        }}
        detaljer={[
            ...epsInputFradrag.flatMap((f) => {
                if (!f.utenlandskInntekt) {
                    return {
                        label: getFradragstypeString(f.type, intl),
                        verdi: formatCurrency(-f.beløp),
                    };
                }
                return [
                    {
                        label: getFradragstypeString(f.type, intl),
                        verdi: formatCurrency(-f.beløp),
                    },
                    {
                        label: intl.formatMessage({
                            id: 'fradrag.utenlandsk.beløp',
                        }),
                        verdi: formatCurrency(f.utenlandskInntekt.beløpIUtenlandskValuta, {
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
                verdi: formatCurrency(epsFribeløp),
            },
        ]}
    />
);

const VisBeregning = (props: Props) => {
    const { intl } = useI18n({ messages: { ...messages, ...fradragstypeMessages } });

    return (
        <div className={styles.beregningdetaljer}>
            {!props.utenTittel && (
                <Heading level="4" size="medium" spacing>
                    {props.beregningsTittel ? props.beregningsTittel : intl.formatMessage({ id: 'page.tittel' })}
                </Heading>
            )}
            <Label className={classNames(styles.totalt, styles.linje)}>
                <span>{intl.formatMessage({ id: 'display.totaltBeløp' })}</span>
                <span>
                    {formatCurrency(
                        props.beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0),
                        {
                            numDecimals: 0,
                        }
                    )}
                </span>
            </Label>
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
                                    tittel: `${formatMonthYear(head.fraOgMed)} - ${formatMonthYear(last.tilOgMed)}`,
                                    beløp: head.beløp,
                                })
                            ),
                            ({ tittel, beløp }) => (
                                <Heading level="5" size="xsmall" className={styles.linje} spacing>
                                    <span>{tittel}</span>
                                    <span>
                                        {formatCurrency(beløp, {
                                            numDecimals: 0,
                                        })}{' '}
                                        i mnd
                                    </span>
                                </Heading>
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
                                <span>{formatCurrency(månedsberegninger[0].satsbeløp)}</span>
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
                                                    verdi: formatCurrency(-fradrag.beløp),
                                                }}
                                                detaljer={[
                                                    {
                                                        label: intl.formatMessage({
                                                            id: 'fradrag.utenlandsk.beløp',
                                                        }),
                                                        verdi: formatCurrency(
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
                                                <span>{formatCurrency(-fradrag.beløp)}</span>
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
                                            verdi: formatCurrency(0),
                                        }}
                                        detaljer={[
                                            ...månedsberegninger[0].epsInputFradrag.flatMap((f) => {
                                                if (!f.utenlandskInntekt) {
                                                    return {
                                                        label: getFradragstypeString(f.type, intl),
                                                        verdi: formatCurrency(-f.beløp),
                                                    };
                                                }
                                                return [
                                                    {
                                                        label: getFradragstypeString(f.type, intl),
                                                        verdi: formatCurrency(-f.beløp),
                                                    },
                                                    {
                                                        label: intl.formatMessage({
                                                            id: 'fradrag.utenlandsk.beløp',
                                                        }),
                                                        verdi: formatCurrency(
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
                                                verdi: formatCurrency(månedsberegninger[0].epsFribeløp),
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
