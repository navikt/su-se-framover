import { BodyShort, Heading, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import { Fragment } from 'react';

import fradragstypeMessages from '~src/components/forms/vilkårOgGrunnlagForms/VilkårOgGrunnlagForms-nb';
import { combineOptions, pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { Beregning, eqMånedsberegningBortsettFraPeriode, Månedsberegning } from '~src/types/Beregning';
import { EksternGrunnlagSkatt } from '~src/types/EksterneGrunnlag';
import { Fradrag, IkkeVelgbareFradragskategorier } from '~src/types/Fradrag';
import { Sats } from '~src/types/Sats';
import { groupBy, groupByEq } from '~src/utils/array/arrayUtils';
import { formatMonthYear } from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';

import SeSkattegrunnlag from '../../oppsummeringAvSkattegrunnlag/Skattegrunnlagsmodal';
import styles from './OppsummeringAvBeregning.module.less';
import messages from './OppsummeringAvBeregning-nb';

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
                beskrivelse: fradrag[0].beskrivelse,
                tilhører: fradrag[0].tilhører,
                utenlandskInntekt: fradrag[0].utenlandskInntekt,
                periode: fradrag[0].periode,
            })),
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
                <Fragment key={d.label + index}>
                    <BodyShort size="small" className={d.epsUtland ? styles.additionalDetails : styles.detailedLinje}>
                        {d.label}
                    </BodyShort>
                    <BodyShort size="small" className={styles.alignTextRight}>
                        {d.verdi}
                    </BodyShort>
                </Fragment>
            ))}
        </>
    </>
);

const VisBenyttetEpsFradrag = ({
    fradrag,
    epsInputFradrag,
    epsFribeløp,
}: {
    fradrag: Fradrag;
    epsInputFradrag: Fradrag[];
    epsFribeløp: number;
}) => {
    const { formatMessage, intl } = useI18n({ messages: { ...messages, ...fradragstypeMessages } });
    return (
        // Hvis denne finns så eksisterer det fradrag for EPS i aktuell måned
        <DetaljertFradrag
            tittel={{
                label: formatMessage(fradrag.type),
                verdi: formatCurrency(-fradrag.beløp),
            }}
            detaljer={[
                ...epsInputFradrag.flatMap((f) => {
                    if (!f.utenlandskInntekt) {
                        return {
                            label: formatMessage(f.type),
                            verdi: formatCurrency(-f.beløp),
                        };
                    }
                    return [
                        {
                            label: formatMessage(f.type),
                            verdi: formatCurrency(-f.beløp),
                        },
                        {
                            label: formatMessage('fradrag.utenland.beløpIUtenlandskValuta'),
                            verdi: formatCurrency(f.utenlandskInntekt.beløpIUtenlandskValuta, {
                                currency: f.utenlandskInntekt.valuta,
                            }),
                            epsUtland: true,
                        },
                        {
                            label: formatMessage('fradrag.utenland.kurs'),
                            verdi: intl.formatNumber(f.utenlandskInntekt.kurs),
                            epsUtland: true,
                        },
                    ];
                }),
                {
                    label: formatMessage('fradrag.eps.fribeløp'),
                    verdi: formatCurrency(epsFribeløp),
                },
            ]}
        />
    );
};

const OppsummeringAvBeregning = (props: {
    beregningsTittel?: string;
    utenTittel?: boolean;
    beregning: Beregning;
    eksternGrunnlagSkatt: Nullable<EksternGrunnlagSkatt>;
}) => {
    const { formatMessage, intl } = useI18n({ messages: { ...messages, ...fradragstypeMessages } });

    return (
        <div className={styles.beregningdetaljer}>
            {!props.utenTittel && (
                <Heading level="4" size="medium" spacing>
                    {props.beregningsTittel ? props.beregningsTittel : formatMessage('page.tittel')}
                </Heading>
            )}
            <Label className={classNames(styles.totalt, styles.linje)}>
                <span>{formatMessage('display.totaltBeløp')}</span>
                <span>
                    {formatCurrency(
                        props.beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0),
                        {
                            numDecimals: 0,
                        },
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
                                }),
                            ),
                            ({ tittel, beløp }) => (
                                <Label className={styles.linje} spacing>
                                    <span>{tittel}</span>
                                    <span>
                                        {formatCurrency(beløp, {
                                            numDecimals: 0,
                                        })}{' '}
                                        i mnd
                                    </span>
                                </Label>
                            ),
                        )}

                        <ol className={styles.fradragliste}>
                            <li className={styles.linje}>
                                <span>
                                    {formatMessage(
                                        månedsberegninger[0].sats === Sats.Høy
                                            ? 'display.visBeregning.sats.høy'
                                            : 'display.visBeregning.sats.ordinær',
                                    )}
                                </span>
                                <span>{formatCurrency(månedsberegninger[0].satsbeløp)}</span>
                            </li>
                            {pipe(
                                månedsberegninger[0],
                                getBenyttedeFradrag,
                                arr.sortBy([
                                    pipe(
                                        S.Ord,
                                        Ord.contramap((f: Fradrag) => f.tilhører),
                                    ),
                                    pipe(
                                        S.Ord,
                                        Ord.contramap((f: Fradrag) => f.type),
                                    ),
                                ]),
                                arr.map((fradrag) => (
                                    <li key={getFradragsnøkkel(fradrag) + index} className={styles.linje}>
                                        {fradrag.type === IkkeVelgbareFradragskategorier.BeregnetFradragEPS ? (
                                            <VisBenyttetEpsFradrag
                                                fradrag={fradrag}
                                                epsInputFradrag={månedsberegninger[0].epsInputFradrag}
                                                epsFribeløp={månedsberegninger[0].epsFribeløp}
                                            />
                                        ) : fradrag.utenlandskInntekt !== null ? (
                                            <DetaljertFradrag
                                                tittel={{
                                                    label: formatMessage(fradrag.type),
                                                    verdi: formatCurrency(-fradrag.beløp),
                                                }}
                                                detaljer={[
                                                    {
                                                        label: formatMessage('fradrag.utenland.beløpIUtenlandskValuta'),
                                                        verdi: formatCurrency(
                                                            fradrag.utenlandskInntekt.beløpIUtenlandskValuta,
                                                            {
                                                                currency: fradrag.utenlandskInntekt.valuta,
                                                            },
                                                        ),
                                                    },
                                                    {
                                                        label: formatMessage('fradrag.utenland.kurs'),
                                                        verdi: intl.formatNumber(fradrag.utenlandskInntekt.kurs),
                                                    },
                                                ]}
                                            />
                                        ) : (
                                            <>
                                                <span>{formatMessage(fradrag.type)}</span>
                                                <span>{formatCurrency(-fradrag.beløp)}</span>
                                            </>
                                        )}
                                    </li>
                                )),
                            )}
                            {pipe(månedsberegninger[0], getBenyttedeFradrag, (benyttedeFradrag) => {
                                return (
                                    månedsberegninger[0].epsInputFradrag.length === 0 ||
                                    benyttedeFradrag.some(
                                        (fradrag) => fradrag.type === IkkeVelgbareFradragskategorier.BeregnetFradragEPS,
                                    ) // Beregnet fradrag er når det er over fribeløp
                                );
                            }) ? null : (
                                // TODO ai 30.04.2021: determine key for list of fradrag for eps
                                <li key={Math.random()} className={styles.linje}>
                                    <DetaljertFradrag
                                        tittel={{
                                            label:
                                                formatMessage(IkkeVelgbareFradragskategorier.BeregnetFradragEPS) +
                                                ' (lavere enn fribeløp, ikke inkludert)',
                                            verdi: formatCurrency(0),
                                        }}
                                        detaljer={[
                                            ...månedsberegninger[0].epsInputFradrag.flatMap((f) => {
                                                if (!f.utenlandskInntekt) {
                                                    return {
                                                        label: formatMessage(f.type),
                                                        verdi: formatCurrency(-f.beløp),
                                                    };
                                                }
                                                return [
                                                    {
                                                        label: formatMessage(f.type),
                                                        verdi: formatCurrency(-f.beløp),
                                                    },
                                                    {
                                                        label: formatMessage('fradrag.utenland.beløpIUtenlandskValuta'),
                                                        verdi: formatCurrency(
                                                            f.utenlandskInntekt.beløpIUtenlandskValuta,
                                                            {
                                                                currency: f.utenlandskInntekt.valuta,
                                                            },
                                                        ),
                                                        epsUtland: true,
                                                    },
                                                    {
                                                        label: formatMessage('fradrag.utenland.kurs'),
                                                        verdi: intl.formatNumber(f.utenlandskInntekt.kurs),
                                                        epsUtland: true,
                                                    },
                                                ];
                                            }),
                                            {
                                                label: formatMessage('fradrag.eps.fribeløp'),
                                                verdi: formatCurrency(månedsberegninger[0].epsFribeløp),
                                            },
                                        ]}
                                    />
                                </li>
                            )}
                        </ol>
                    </div>
                )),
            )}
            {props.eksternGrunnlagSkatt && <SeSkattegrunnlag eksternGrunnlagSkatt={props.eksternGrunnlagSkatt} />}
        </div>
    );
};

export default OppsummeringAvBeregning;
