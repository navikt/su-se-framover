import { NextFilled } from '@navikt/ds-icons';
import { Alert, BodyShort, Button, Heading, Modal } from '@navikt/ds-react';
import classNames from 'classnames';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import { Element, Systemtittel, Undertekst } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';

import messages from '~components/beregningOgSimulering/beregning/beregning-nb';
import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import { Beregning, eqMånedsberegningBortsettFraPeriodeOgMerknad, Månedsberegning } from '~types/Beregning';
import { Beregningsmerknad, Beregningsmerknadtype } from '~types/Beregningsmerknad';
import { Fradrag, Fradragstype } from '~types/Fradrag';
import { Sats } from '~types/Sats';
import { groupBy, groupByEq } from '~utils/array/arrayUtils';
import { formatMonthYear, formatPeriode } from '~utils/date/dateUtils';
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

const Månedsberegninggruppe = ({
    månedsberegninger,
    intl,
}: {
    månedsberegninger: Månedsberegning[];
    intl: IntlShape;
}) => {
    const periodeoppsummering = pipe(
        combineOptions([arr.head(månedsberegninger), arr.last(månedsberegninger)]),
        Option.fold(
            () => ({
                tittel: '?',
                beløp: 0,
            }),
            ([head, last]) => ({
                tittel: formatPeriode({
                    fraOgMed: head.fraOgMed,
                    tilOgMed: last.tilOgMed,
                }),
                beløp: head.beløp,
            })
        )
    );
    return (
        <div key={månedsberegninger[0].fraOgMed}>
            <Element tag="h3" className={classNames(styles.periodeoverskrift, styles.linje)}>
                <span>{periodeoppsummering.tittel}</span>
                <span>
                    {`${formatCurrency(periodeoppsummering.beløp, {
                        numDecimals: 0,
                    })} i mnd`}
                </span>
            </Element>

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
                        <li
                            key={`${periodeoppsummering.tittel}-${getFradragsnøkkel(fradrag)}`}
                            className={styles.linje}
                        >
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
                                            verdi: formatCurrency(fradrag.utenlandskInntekt.beløpIUtenlandskValuta, {
                                                currency: fradrag.utenlandskInntekt.valuta,
                                            }),
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
                    <li key="beregnet fradrag eps" className={styles.linje}>
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
                                    verdi: formatCurrency(månedsberegninger[0].epsFribeløp),
                                },
                            ]}
                        />
                    </li>
                )}
            </ol>
        </div>
    );
};

const merknadstypeName = (type: Beregningsmerknadtype) => {
    switch (type) {
        case Beregningsmerknadtype.EndringGrunnbeløp:
            return 'merknad.type.endringGrunnbeløp';
        case Beregningsmerknadtype.NyYtelse:
            return 'merknad.type.nyYtelse';
        case Beregningsmerknadtype.ØktYtelse:
            return 'merknad.type.øktYtelse';
        case Beregningsmerknadtype.RedusertYtelse:
            return 'merknad.type.redusertYtelse';
        case Beregningsmerknadtype.EndringUnderTiProsent:
            return 'merknad.type.endringUnderTiProsent';
    }
};

const Merknadvisning = (props: { merknad: Beregningsmerknad; intl: IntlShape }) => {
    const body = React.useMemo(() => {
        switch (props.merknad.type) {
            case Beregningsmerknadtype.EndringGrunnbeløp:
                return (
                    <div className={classNames(styles.beregningdetaljer, styles.merknadBeregningContainer)}>
                        <div>
                            <Heading level="2" size="large" spacing>
                                {props.intl.formatMessage({ id: 'merknad.heading.gammeltGrunnbeløp' })}
                            </Heading>
                            <BodyShort>
                                {props.intl.formatMessage(
                                    {
                                        id: 'merknad.detail.grunnbeløp',
                                    },
                                    {
                                        grunnbeløp: formatCurrency(props.merknad.gammeltGrunnbeløp.grunnbeløp),
                                        dato: formatMonthYear(props.merknad.gammeltGrunnbeløp.dato),
                                    }
                                )}
                            </BodyShort>
                        </div>
                        <div>
                            <Heading level="2" size="large" spacing>
                                {props.intl.formatMessage({ id: 'merknad.heading.nyttGrunnbeløp' })}
                            </Heading>
                            <BodyShort>
                                {props.intl.formatMessage(
                                    {
                                        id: 'merknad.detail.grunnbeløp',
                                    },
                                    {
                                        grunnbeløp: formatCurrency(props.merknad.nyttGrunnbeløp.grunnbeløp),
                                        dato: formatMonthYear(props.merknad.nyttGrunnbeløp.dato),
                                    }
                                )}
                            </BodyShort>
                        </div>
                    </div>
                );
            case Beregningsmerknadtype.NyYtelse:
                return (
                    <div className={classNames(styles.beregningdetaljer, styles.merknadBeregningContainer)}>
                        <div>
                            <Heading level="2" size="large" spacing>
                                {props.intl.formatMessage({ id: 'merknad.heading.benyttetBeregning' })}
                            </Heading>
                            <Månedsberegninggruppe
                                intl={props.intl}
                                månedsberegninger={[
                                    {
                                        ...props.merknad.benyttetBeregning,
                                        epsFribeløp: 0,
                                        epsInputFradrag: [],
                                        merknader: [],
                                    },
                                ]}
                            />
                        </div>
                    </div>
                );
            case Beregningsmerknadtype.ØktYtelse:
            case Beregningsmerknadtype.RedusertYtelse:
            case Beregningsmerknadtype.EndringUnderTiProsent:
                return (
                    <div className={classNames(styles.beregningdetaljer, styles.merknadBeregningContainer)}>
                        <div>
                            <Heading level="2" size="large" spacing>
                                {props.intl.formatMessage({ id: 'merknad.heading.forkastetBeregning' })}
                            </Heading>
                            <Månedsberegninggruppe
                                intl={props.intl}
                                månedsberegninger={[
                                    {
                                        ...props.merknad.forkastetBeregning,
                                        epsFribeløp: 0,
                                        epsInputFradrag: [],
                                        merknader: [],
                                    },
                                ]}
                            />
                        </div>
                        <div>
                            <Heading level="2" size="large" spacing>
                                {props.intl.formatMessage({ id: 'merknad.heading.benyttetBeregning' })}
                            </Heading>
                            <Månedsberegninggruppe
                                intl={props.intl}
                                månedsberegninger={[
                                    {
                                        ...props.merknad.benyttetBeregning,
                                        epsFribeløp: 0,
                                        epsInputFradrag: [],
                                        merknader: [],
                                    },
                                ]}
                            />
                        </div>
                    </div>
                );
        }
    }, [props.merknad]);

    return (
        <div className={styles.merknadContainer}>
            <Heading level="1" size="xlarge">
                {props.intl.formatMessage({ id: merknadstypeName(props.merknad.type) })}
            </Heading>
            {body}
        </div>
    );
};

const Merknader = (props: { beregning: Beregning; intl: IntlShape }) => {
    const [modals, setModals] = useState<Record<string, boolean>>({});

    return (
        <div>
            {props.beregning.månedsberegninger
                .map((mb) => ({
                    periode: { fraOgMed: mb.fraOgMed, tilOgMed: mb.tilOgMed },
                    merknader: mb.merknader,
                }))
                .filter(({ merknader }) => merknader.length > 0)
                .map(({ periode, merknader }) => (
                    <Alert key={periode.fraOgMed} variant="warning" fullWidth>
                        <Heading level="3" size="small" spacing>
                            {props.intl.formatMessage({ id: 'merknad.heading' })}
                        </Heading>
                        <ul>
                            {merknader.map((m) => {
                                const modalKey = periode.fraOgMed + m.type;
                                return (
                                    <li key={m.type}>
                                        <Button
                                            variant="tertiary"
                                            type="button"
                                            onClick={() => {
                                                setModals((ms) => ({ ...ms, [modalKey]: true }));
                                            }}
                                        >
                                            {`${formatPeriode(periode)}: ${props.intl.formatMessage({
                                                id: merknadstypeName(m.type),
                                            })}`}
                                            <NextFilled />
                                        </Button>
                                        <Modal
                                            open={modals[modalKey]}
                                            onClose={() => {
                                                setModals((ms) => ({ ...ms, [modalKey]: false }));
                                            }}
                                        >
                                            <Modal.Content>
                                                <Merknadvisning intl={props.intl} merknad={m} />
                                            </Modal.Content>
                                        </Modal>
                                    </li>
                                );
                            })}
                        </ul>
                    </Alert>
                ))}
        </div>
    );
};

const VisBeregning = (props: Props) => {
    const { intl } = useI18n({ messages: { ...messages, ...fradragstypeMessages } });

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
                        props.beregning.månedsberegninger.reduce((acc, val) => acc + val.beløp, 0),
                        {
                            numDecimals: 0,
                        }
                    )}
                </span>
            </Element>
            {pipe(
                props.beregning.månedsberegninger,
                groupByEq(eqMånedsberegningBortsettFraPeriodeOgMerknad),
                arr.mapWithIndex((index, månedsberegninger) => (
                    <Månedsberegninggruppe key={index} månedsberegninger={månedsberegninger} intl={intl} />
                ))
            )}
            <Merknader beregning={props.beregning} intl={intl} />
        </div>
    );
};
export default VisBeregning;
