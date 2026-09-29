import * as RemoteData from '@devexperts/remote-data-ts';
import {
    Alert,
    BodyShort,
    Box,
    Button,
    Checkbox,
    ExpansionCard,
    Heading,
    HStack,
    Label,
    Loader,
    Select,
    TextField,
    VStack,
} from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import {
    beregnHistoriskInfotrygdRevurdering,
    hentHistoriskInfotrygdMånedsgrunnlag,
} from '~src/api/historiskAlderssakApi';
import { useApiCall } from '~src/lib/hooks';
import { VelgbareFradragskategorier } from '~src/types/Fradrag';
import {
    HistoriskInfotrygdBeregningsgrunnlagForMåned,
    HistoriskInfotrygdFradragForMåned,
    HistoriskInfotrygdLagretBeregning,
    HistoriskInfotrygdManuellOpphørsgrunn,
    HistoriskInfotrygdMånedsgrunnlag,
    HistoriskInfotrygdRevurdering,
    HistoriskInfotrygdSatskategori,
} from '~src/types/HistoriskInfotrygdRevurdering';
import { formatCurrency } from '~src/utils/format/formatUtils';

import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';
import { fradragskoderForVisning } from './HistoriskAlderssakUtils';
import styles from './HistoriskAlderssakVisning.module.less';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    onOppdatert: (behandling: HistoriskInfotrygdRevurdering) => void;
}

const satskategorier: { value: HistoriskInfotrygdSatskategori; label: string }[] = [
    { value: 'EN', label: 'Enslig' },
    { value: 'EU', label: 'Ektefelle under 67 år' },
    { value: 'EO', label: 'Ektefelle over 67 år' },
    { value: 'EV', label: 'Enslig med bofellesskap' },
];

const opphørsgrunner: { value: HistoriskInfotrygdManuellOpphørsgrunn; label: string }[] = [
    { value: 'FORMUE', label: 'Formue' },
    { value: 'UTENLANDSOPPHOLD', label: 'Utenlandsopphold' },
    { value: 'MANGLENDE_DOKUMENTASJON', label: 'Manglende dokumentasjon' },
    { value: 'OPPHOLDSTILLATELSE', label: 'Oppholdstillatelse' },
    { value: 'FLYKTNING', label: 'Flyktningstatus' },
    { value: 'BOR_OG_OPPHOLDER_SEG_I_NORGE', label: 'Bor og oppholder seg i Norge' },
    { value: 'PERSONLIG_OPPMØTE', label: 'Personlig oppmøte' },
    { value: 'INNLAGT_PÅ_INSTITUSJON', label: 'Innlagt på institusjon' },
    { value: 'ALDERSPENSJON', label: 'Alderspensjon' },
    { value: 'FAMILIEGJENFORENING', label: 'Familiegjenforening' },
];

const økonomiskRetningTekst = {
    INGEN_ENDRING: 'Ingen endring',
    ETTERBETALING: 'Etterbetaling',
    FEILUTBETALING: 'Feilutbetaling',
} as const;

const tomtFradrag = (): HistoriskInfotrygdFradragForMåned => ({
    type: VelgbareFradragskategorier.Alderspensjon,
    beskrivelse: null,
    månedsbeløp: 0,
    utenlandskInntekt: null,
    tilhører: 'BRUKER',
});

const lagSkjemagrunnlag = (grunnlag: HistoriskInfotrygdMånedsgrunnlag) => {
    const lagret = new Map(grunnlag.beregning?.måneder.map((måned) => [måned.måned, måned]));

    return grunnlag.måneder.map<HistoriskInfotrygdBeregningsgrunnlagForMåned>((måned) => {
        const lagretMåned = lagret.get(måned.måned);
        return {
            måned: måned.måned,
            satskategori: lagretMåned?.satskategori ?? måned.foreslåttSatskategori ?? 'EN',
            fradrag: lagretMåned?.fradrag ?? [],
            manueltOpphør: lagretMåned?.manueltOpphør ?? null,
        };
    });
};

const Forsørgingstillegg = (props: { grunnlag: HistoriskInfotrygdMånedsgrunnlag }) => {
    const berørteMåneder = props.grunnlag.måneder.filter((måned) => måned.kreverKontrollAvHistoriskForsørgingstillegg);

    if (!props.grunnlag.kreverKontrollAvHistoriskForsørgingstillegg) {
        return null;
    }

    return (
        <Alert variant="info">
            <VStack gap="4" align="start">
                <div>
                    <Heading level="2" size="small" spacing>
                        Mulig forsørgingstillegg i historiske beløp
                    </Heading>
                    <BodyShort spacing>
                        Denne stønadsperioden startet før 1. januar 2015. Etter reglene som gjaldt da, kunne supplerende
                        stønad inneholde forsørgingstillegg for barn under 18 år. Historiske data viser ikke om det
                        utbetalte beløpet inneholdt et slikt tillegg.
                    </BodyShort>
                </div>
                <ul>
                    {berørteMåneder.map((måned) => (
                        <li key={måned.måned}>
                            {måned.måned}:{' '}
                            {måned.historiskBeløp === null ? 'Beløp mangler' : formatCurrency(måned.historiskBeløp)}
                        </li>
                    ))}
                </ul>
                <BodyShort size="small">
                    Etter tidligere § 5 ble ytelsen økt med 40 prosent av grunnbeløpet per barn under 18 år som
                    mottakeren forsørget og bodde sammen med. Før avviklingen var tillegget 20 prosent av minste
                    pensjonsnivå med høy sats per barn. Kilde: Prop. 14 L (2014–2015), kapittel 7.
                </BodyShort>
            </VStack>
        </Alert>
    );
};

const HistoriskInfotrygdBeregning = (props: Props) => {
    const [grunnlagStatus, hentGrunnlag] = useApiCall(hentHistoriskInfotrygdMånedsgrunnlag);
    const [beregnStatus, beregn] = useApiCall(beregnHistoriskInfotrygdRevurdering);
    const [måneder, setMåneder] = useState<HistoriskInfotrygdBeregningsgrunnlagForMåned[]>([]);
    const [beregningEtterLagring, setBeregningEtterLagring] = useState<HistoriskInfotrygdLagretBeregning | null>(null);
    const [valideringsfeil, setValideringsfeil] = useState<string>();
    const [resultatForPerioden, setResultatForPerioden] = useState<'YTELSE' | 'OPPHØR'>('YTELSE');
    const [opphørsgrunnForPerioden, setOpphørsgrunnForPerioden] =
        useState<HistoriskInfotrygdManuellOpphørsgrunn | null>(null);

    const lastGrunnlag = () =>
        hentGrunnlag(props.behandling.id, (grunnlag) => {
            setMåneder(lagSkjemagrunnlag(grunnlag));
            const lagretOpphør = grunnlag.beregning?.måneder.find((måned) => måned.manueltOpphør)?.manueltOpphør;
            setResultatForPerioden(lagretOpphør ? 'OPPHØR' : 'YTELSE');
            setOpphørsgrunnForPerioden(lagretOpphør?.opphørsgrunn ?? null);
        });

    useEffect(() => {
        lastGrunnlag();
    }, [props.behandling.id]);

    const oppdaterMåned = (
        index: number,
        oppdater: (måned: HistoriskInfotrygdBeregningsgrunnlagForMåned) => HistoriskInfotrygdBeregningsgrunnlagForMåned,
    ) => setMåneder((gjeldende) => gjeldende.map((måned, i) => (i === index ? oppdater(måned) : måned)));

    const handleBeregn = () => {
        if (resultatForPerioden === 'OPPHØR' && !opphørsgrunnForPerioden) {
            setValideringsfeil('Velg opphørsgrunn for hele perioden.');
            return;
        }

        setValideringsfeil(undefined);
        const beregningsmåneder = måneder.map((måned) => ({
            ...måned,
            manueltOpphør:
                resultatForPerioden === 'OPPHØR' && opphørsgrunnForPerioden
                    ? { opphørsgrunn: opphørsgrunnForPerioden }
                    : null,
        }));

        beregn(
            {
                revurderingId: props.behandling.id,
                måneder: beregningsmåneder,
            },
            (resultat) => {
                setBeregningEtterLagring({
                    økonomiskRetning: resultat.økonomiskRetning,
                    måneder: resultat.måneder,
                });
                props.onOppdatert(resultat.behandling);
            },
        );
    };

    if (RemoteData.isInitial(grunnlagStatus) || RemoteData.isPending(grunnlagStatus)) {
        return <Loader title="Henter månedsgrunnlag" size="large" />;
    }
    if (RemoteData.isFailure(grunnlagStatus)) {
        return <HistoriskAlderssakApiErrorAlert error={grunnlagStatus.error} />;
    }

    const grunnlag = grunnlagStatus.value;
    const beregning = beregningEtterLagring ?? grunnlag.beregning;
    const kanRedigeres = ['OPPRETTET', 'BEREGNET', 'UNDERKJENT'].includes(props.behandling.status);

    return (
        <VStack gap="6">
            <Forsørgingstillegg grunnlag={grunnlag} />
            <section aria-labelledby="utfall-tittel">
                <VStack gap="4">
                    <Heading id="utfall-tittel" level="2" size="medium">
                        Utfall for hele perioden
                    </Heading>
                    <Select
                        label="Utfall"
                        value={resultatForPerioden}
                        readOnly={!kanRedigeres}
                        onChange={(event) => {
                            setResultatForPerioden(event.target.value as 'YTELSE' | 'OPPHØR');
                            setValideringsfeil(undefined);
                        }}
                    >
                        <option value="YTELSE">Ytelse</option>
                        <option value="OPPHØR">Opphør</option>
                    </Select>
                    {resultatForPerioden === 'OPPHØR' && (
                        <Select
                            label="Opphørsgrunn for hele perioden"
                            value={opphørsgrunnForPerioden ?? ''}
                            readOnly={!kanRedigeres}
                            error={
                                valideringsfeil === 'Velg opphørsgrunn for hele perioden.' ? valideringsfeil : undefined
                            }
                            onChange={(event) => {
                                setOpphørsgrunnForPerioden(event.target.value as HistoriskInfotrygdManuellOpphørsgrunn);
                                setValideringsfeil(undefined);
                            }}
                        >
                            <option value="">Velg opphørsgrunn</option>
                            {opphørsgrunner.map((grunn) => (
                                <option key={grunn.value} value={grunn.value}>
                                    {grunn.label}
                                </option>
                            ))}
                        </Select>
                    )}
                </VStack>
            </section>
            <section aria-labelledby="månedsgrunnlag-tittel">
                <VStack gap="4">
                    <Heading id="månedsgrunnlag-tittel" level="2" size="medium">
                        Månedsgrunnlag
                    </Heading>
                    {måneder.map((måned, månedIndex) => {
                        const historisk = grunnlag.måneder[månedIndex];
                        return (
                            <Box
                                key={måned.måned}
                                background="surface-default"
                                borderWidth="1"
                                borderRadius="medium"
                                padding="5"
                            >
                                <VStack gap="4">
                                    <Heading level="3" size="small">
                                        {måned.måned}
                                    </Heading>
                                    <dl className={styles.detaljer}>
                                        <div>
                                            <Label as="dt" size="small">
                                                Historisk beløp
                                            </Label>
                                            <BodyShort as="dd">
                                                {historisk.historiskBeløp === null
                                                    ? 'Ikke registrert'
                                                    : formatCurrency(historisk.historiskBeløp)}
                                            </BodyShort>
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Kilde
                                            </Label>
                                            <BodyShort as="dd">
                                                {historisk.kilde === 'ORIGINAL_PROJEKSJON'
                                                    ? 'Opprinnelig Infotrygd-vedtak'
                                                    : 'Tidligere historisk revurdering'}
                                            </BodyShort>
                                        </div>
                                    </dl>
                                    {resultatForPerioden === 'YTELSE' && (
                                        <>
                                            <Select
                                                label="Satskategori"
                                                value={måned.satskategori}
                                                readOnly={!kanRedigeres}
                                                onChange={(event) =>
                                                    oppdaterMåned(månedIndex, (verdi) => ({
                                                        ...verdi,
                                                        satskategori: event.target
                                                            .value as HistoriskInfotrygdSatskategori,
                                                    }))
                                                }
                                            >
                                                {satskategorier.map((kategori) => (
                                                    <option
                                                        key={kategori.value}
                                                        value={kategori.value}
                                                        disabled={kategori.value === 'EV' && måned.måned < '2016-01'}
                                                    >
                                                        {kategori.label}
                                                    </option>
                                                ))}
                                            </Select>
                                            <VStack gap="3">
                                                <Label>Fradrag</Label>
                                                {måned.fradrag.map((fradrag, fradragIndex) => (
                                                    <Box
                                                        key={`${måned.måned}-${fradragIndex}`}
                                                        background="surface-default"
                                                        padding="4"
                                                    >
                                                        <VStack gap="3">
                                                            <HStack gap="4" wrap>
                                                                <Select
                                                                    label="Type"
                                                                    value={fradrag.type}
                                                                    readOnly={!kanRedigeres}
                                                                    onChange={(event) =>
                                                                        oppdaterMåned(månedIndex, (verdi) => ({
                                                                            ...verdi,
                                                                            fradrag: verdi.fradrag.map((f, i) =>
                                                                                i === fradragIndex
                                                                                    ? { ...f, type: event.target.value }
                                                                                    : f,
                                                                            ),
                                                                        }))
                                                                    }
                                                                >
                                                                    {Object.values(VelgbareFradragskategorier).map(
                                                                        (type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </Select>
                                                                <TextField
                                                                    label="Månedsbeløp"
                                                                    inputMode="decimal"
                                                                    value={fradrag.månedsbeløp}
                                                                    readOnly={!kanRedigeres}
                                                                    onChange={(event) =>
                                                                        oppdaterMåned(månedIndex, (verdi) => ({
                                                                            ...verdi,
                                                                            fradrag: verdi.fradrag.map((f, i) =>
                                                                                i === fradragIndex
                                                                                    ? {
                                                                                          ...f,
                                                                                          månedsbeløp: Number(
                                                                                              event.target.value,
                                                                                          ),
                                                                                      }
                                                                                    : f,
                                                                            ),
                                                                        }))
                                                                    }
                                                                />
                                                                <Select
                                                                    label="Tilhører"
                                                                    value={fradrag.tilhører}
                                                                    readOnly={!kanRedigeres}
                                                                    onChange={(event) =>
                                                                        oppdaterMåned(månedIndex, (verdi) => ({
                                                                            ...verdi,
                                                                            fradrag: verdi.fradrag.map((f, i) =>
                                                                                i === fradragIndex
                                                                                    ? {
                                                                                          ...f,
                                                                                          tilhører: event.target
                                                                                              .value as
                                                                                              | 'BRUKER'
                                                                                              | 'EPS',
                                                                                      }
                                                                                    : f,
                                                                            ),
                                                                        }))
                                                                    }
                                                                >
                                                                    <option value="BRUKER">Brukeren</option>
                                                                    <option value="EPS">Ektefellen</option>
                                                                </Select>
                                                            </HStack>
                                                            {fradrag.type === VelgbareFradragskategorier.Annet && (
                                                                <TextField
                                                                    label="Beskrivelse"
                                                                    value={fradrag.beskrivelse ?? ''}
                                                                    readOnly={!kanRedigeres}
                                                                    onChange={(event) =>
                                                                        oppdaterMåned(månedIndex, (verdi) => ({
                                                                            ...verdi,
                                                                            fradrag: verdi.fradrag.map((f, i) =>
                                                                                i === fradragIndex
                                                                                    ? {
                                                                                          ...f,
                                                                                          beskrivelse:
                                                                                              event.target.value,
                                                                                      }
                                                                                    : f,
                                                                            ),
                                                                        }))
                                                                    }
                                                                />
                                                            )}
                                                            <Checkbox
                                                                checked={fradrag.utenlandskInntekt !== null}
                                                                readOnly={!kanRedigeres}
                                                                onChange={(event) =>
                                                                    oppdaterMåned(månedIndex, (verdi) => ({
                                                                        ...verdi,
                                                                        fradrag: verdi.fradrag.map((f, i) =>
                                                                            i === fradragIndex
                                                                                ? {
                                                                                      ...f,
                                                                                      utenlandskInntekt: event.target
                                                                                          .checked
                                                                                          ? {
                                                                                                beløpIUtenlandskValuta: 0,
                                                                                                valuta: '',
                                                                                                kurs: 0,
                                                                                            }
                                                                                          : null,
                                                                                  }
                                                                                : f,
                                                                        ),
                                                                    }))
                                                                }
                                                            >
                                                                Utenlandsk inntekt
                                                            </Checkbox>
                                                            {fradrag.utenlandskInntekt && (
                                                                <HStack gap="4" wrap>
                                                                    <TextField
                                                                        label="Beløp i utenlandsk valuta"
                                                                        inputMode="decimal"
                                                                        value={
                                                                            fradrag.utenlandskInntekt
                                                                                .beløpIUtenlandskValuta
                                                                        }
                                                                        readOnly={!kanRedigeres}
                                                                        onChange={(event) =>
                                                                            oppdaterMåned(månedIndex, (verdi) => ({
                                                                                ...verdi,
                                                                                fradrag: verdi.fradrag.map((f, i) =>
                                                                                    i === fradragIndex &&
                                                                                    f.utenlandskInntekt
                                                                                        ? {
                                                                                              ...f,
                                                                                              utenlandskInntekt: {
                                                                                                  ...f.utenlandskInntekt,
                                                                                                  beløpIUtenlandskValuta:
                                                                                                      Number(
                                                                                                          event.target
                                                                                                              .value,
                                                                                                      ),
                                                                                              },
                                                                                          }
                                                                                        : f,
                                                                                ),
                                                                            }))
                                                                        }
                                                                    />
                                                                    <TextField
                                                                        label="Valuta"
                                                                        value={fradrag.utenlandskInntekt.valuta}
                                                                        readOnly={!kanRedigeres}
                                                                        onChange={(event) =>
                                                                            oppdaterMåned(månedIndex, (verdi) => ({
                                                                                ...verdi,
                                                                                fradrag: verdi.fradrag.map((f, i) =>
                                                                                    i === fradragIndex &&
                                                                                    f.utenlandskInntekt
                                                                                        ? {
                                                                                              ...f,
                                                                                              utenlandskInntekt: {
                                                                                                  ...f.utenlandskInntekt,
                                                                                                  valuta: event.target
                                                                                                      .value,
                                                                                              },
                                                                                          }
                                                                                        : f,
                                                                                ),
                                                                            }))
                                                                        }
                                                                    />
                                                                    <TextField
                                                                        label="Kurs"
                                                                        inputMode="decimal"
                                                                        value={fradrag.utenlandskInntekt.kurs}
                                                                        readOnly={!kanRedigeres}
                                                                        onChange={(event) =>
                                                                            oppdaterMåned(månedIndex, (verdi) => ({
                                                                                ...verdi,
                                                                                fradrag: verdi.fradrag.map((f, i) =>
                                                                                    i === fradragIndex &&
                                                                                    f.utenlandskInntekt
                                                                                        ? {
                                                                                              ...f,
                                                                                              utenlandskInntekt: {
                                                                                                  ...f.utenlandskInntekt,
                                                                                                  kurs: Number(
                                                                                                      event.target
                                                                                                          .value,
                                                                                                  ),
                                                                                              },
                                                                                          }
                                                                                        : f,
                                                                                ),
                                                                            }))
                                                                        }
                                                                    />
                                                                </HStack>
                                                            )}
                                                            {kanRedigeres && (
                                                                <Button
                                                                    type="button"
                                                                    variant="tertiary"
                                                                    onClick={() =>
                                                                        oppdaterMåned(månedIndex, (verdi) => ({
                                                                            ...verdi,
                                                                            fradrag: verdi.fradrag.filter(
                                                                                (_, i) => i !== fradragIndex,
                                                                            ),
                                                                        }))
                                                                    }
                                                                >
                                                                    Fjern fradrag
                                                                </Button>
                                                            )}
                                                        </VStack>
                                                    </Box>
                                                ))}
                                                {kanRedigeres && (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            oppdaterMåned(månedIndex, (verdi) => ({
                                                                ...verdi,
                                                                fradrag: [...verdi.fradrag, tomtFradrag()],
                                                            }))
                                                        }
                                                    >
                                                        Legg til fradrag
                                                    </Button>
                                                )}
                                            </VStack>
                                        </>
                                    )}
                                    {resultatForPerioden === 'OPPHØR' && (
                                        <BodyShort>
                                            Opphørsgrunn for måneden:{' '}
                                            {opphørsgrunner.find((grunn) => grunn.value === opphørsgrunnForPerioden)
                                                ?.label ?? 'Velg opphørsgrunn for hele perioden'}
                                        </BodyShort>
                                    )}
                                </VStack>
                            </Box>
                        );
                    })}
                    {kanRedigeres && (
                        <>
                            {RemoteData.isFailure(beregnStatus) && (
                                <HistoriskAlderssakApiErrorAlert error={beregnStatus.error} />
                            )}
                            <Button type="button" loading={RemoteData.isPending(beregnStatus)} onClick={handleBeregn}>
                                Lagre og beregn
                            </Button>
                        </>
                    )}
                </VStack>
            </section>
            {beregning && (
                <section aria-labelledby="beregningsresultat-tittel">
                    <VStack gap="4">
                        <div>
                            <Heading id="beregningsresultat-tittel" level="2" size="medium" spacing>
                                Beregning
                            </Heading>
                            <BodyShort>
                                Økonomisk retning: {økonomiskRetningTekst[beregning.økonomiskRetning]}
                            </BodyShort>
                            <BodyShort>Antall måneder: {beregning.måneder.length}</BodyShort>
                        </div>
                        {beregning.måneder.map((resultat) =>
                            (() => {
                                const historisk = grunnlag.måneder.find((måned) => måned.måned === resultat.måned);

                                return (
                                    <ExpansionCard key={resultat.måned} aria-label={`Beregning for ${resultat.måned}`}>
                                        <ExpansionCard.Header>
                                            <ExpansionCard.Title as="h3" size="small">
                                                {resultat.måned}
                                            </ExpansionCard.Title>
                                            <ExpansionCard.Description>
                                                {resultat.nyttResultat === 'YTELSE' ? 'Ytelse' : 'Opphør'}. Gammelt
                                                beløp: {formatCurrency(resultat.gammeltBeløp)}. Nytt beløp:{' '}
                                                {formatCurrency(resultat.nyttBeløp)}. Differanse:{' '}
                                                {formatCurrency(resultat.differanse)}.
                                            </ExpansionCard.Description>
                                        </ExpansionCard.Header>
                                        <ExpansionCard.Content>
                                            <div className={styles.beregningssammenligning}>
                                                <section aria-label="Grunnlag før revurderingen">
                                                    <Heading level="4" size="xsmall" spacing>
                                                        Grunnlag før revurderingen
                                                    </Heading>
                                                    <dl className={styles.detaljer}>
                                                        <div>
                                                            <Label as="dt" size="small">
                                                                Beløp brukt i beregningen
                                                            </Label>
                                                            <BodyShort as="dd">
                                                                {formatCurrency(resultat.gammeltBeløp)}
                                                            </BodyShort>
                                                        </div>
                                                        <div>
                                                            <Label as="dt" size="small">
                                                                Historisk sats
                                                            </Label>
                                                            <BodyShort as="dd">
                                                                {historisk?.historiskSats === null ||
                                                                historisk?.historiskSats === undefined
                                                                    ? 'Ikke registrert'
                                                                    : formatCurrency(historisk.historiskSats)}
                                                            </BodyShort>
                                                        </div>
                                                        <div>
                                                            <Label as="dt" size="small">
                                                                Historisk fradrag
                                                            </Label>
                                                            <BodyShort as="dd">
                                                                {historisk?.historiskFradrag === null ||
                                                                historisk?.historiskFradrag === undefined
                                                                    ? 'Ikke registrert'
                                                                    : formatCurrency(historisk.historiskFradrag)}
                                                            </BodyShort>
                                                        </div>
                                                        <div>
                                                            <Label as="dt" size="small">
                                                                Historisk beløp
                                                            </Label>
                                                            <BodyShort as="dd">
                                                                {historisk?.historiskBeløp === null ||
                                                                historisk?.historiskBeløp === undefined
                                                                    ? 'Ikke registrert'
                                                                    : formatCurrency(historisk.historiskBeløp)}
                                                            </BodyShort>
                                                        </div>
                                                        {historisk && historisk.historiskFradragskoder.length > 0 && (
                                                            <div>
                                                                <Label as="dt" size="small">
                                                                    Historiske fradragskoder
                                                                </Label>
                                                                <BodyShort as="dd">
                                                                    {fradragskoderForVisning(
                                                                        historisk.historiskFradragskoder,
                                                                    ).join(', ')}
                                                                </BodyShort>
                                                            </div>
                                                        )}
                                                    </dl>
                                                </section>
                                                <section aria-label="Ny beregning">
                                                    <Heading level="4" size="xsmall" spacing>
                                                        Ny beregning
                                                    </Heading>
                                                    <dl className={styles.detaljer}>
                                                        <div>
                                                            <Label as="dt" size="small">
                                                                Satskategori
                                                            </Label>
                                                            <BodyShort as="dd">{resultat.satskategori}</BodyShort>
                                                        </div>
                                                        <div>
                                                            <Label as="dt" size="small">
                                                                Nye fradrag
                                                            </Label>
                                                            {resultat.fradrag.length > 0 ? (
                                                                <ul className={styles.beregningsfradrag}>
                                                                    {resultat.fradrag.map((fradrag, index) => (
                                                                        <li key={`${fradrag.type}-${index}`}>
                                                                            {fradrag.type}
                                                                            {fradrag.beskrivelse
                                                                                ? ` (${fradrag.beskrivelse})`
                                                                                : ''}
                                                                            : {formatCurrency(fradrag.månedsbeløp)}{' '}
                                                                            {fradrag.tilhører === 'EPS'
                                                                                ? '(ektefellen)'
                                                                                : '(brukeren)'}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <BodyShort as="dd">Ingen fradrag</BodyShort>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Label as="dt" size="small">
                                                                Nytt beløp
                                                            </Label>
                                                            <BodyShort as="dd">
                                                                {formatCurrency(resultat.nyttBeløp)}
                                                            </BodyShort>
                                                        </div>
                                                        <div>
                                                            <Label as="dt" size="small">
                                                                Differanse
                                                            </Label>
                                                            <BodyShort as="dd">
                                                                {formatCurrency(resultat.differanse)}
                                                            </BodyShort>
                                                        </div>
                                                        <div>
                                                            <Label as="dt" size="small">
                                                                Nytt resultat
                                                            </Label>
                                                            <BodyShort as="dd">
                                                                {resultat.nyttResultat === 'YTELSE'
                                                                    ? 'Ytelse'
                                                                    : 'Opphør'}
                                                            </BodyShort>
                                                        </div>
                                                        {resultat.opphørsgrunn && (
                                                            <div>
                                                                <Label as="dt" size="small">
                                                                    Opphørsgrunn
                                                                </Label>
                                                                <BodyShort as="dd">{resultat.opphørsgrunn}</BodyShort>
                                                            </div>
                                                        )}
                                                    </dl>
                                                </section>
                                            </div>
                                        </ExpansionCard.Content>
                                    </ExpansionCard>
                                );
                            })(),
                        )}
                    </VStack>
                </section>
            )}
        </VStack>
    );
};

export default HistoriskInfotrygdBeregning;
