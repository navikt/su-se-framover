import * as RemoteData from '@devexperts/remote-data-ts';
import {
    Alert,
    BodyShort,
    Box,
    Button,
    Checkbox,
    Heading,
    HStack,
    Label,
    Loader,
    Select,
    Textarea,
    TextField,
    VStack,
} from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import {
    bekreftHistoriskForsørgingstillegg,
    beregnHistoriskInfotrygdRevurdering,
    hentHistoriskInfotrygdMånedsgrunnlag,
} from '~src/api/historiskAlderssakApi';
import { useApiCall } from '~src/lib/hooks';
import { VelgbareFradragskategorier } from '~src/types/Fradrag';
import {
    HistoriskInfotrygdBeregningsgrunnlagForMåned,
    HistoriskInfotrygdFradragForMåned,
    HistoriskInfotrygdManuellOpphørsgrunn,
    HistoriskInfotrygdMånedsgrunnlag,
    HistoriskInfotrygdRevurdering,
    HistoriskInfotrygdSatskategori,
} from '~src/types/HistoriskInfotrygdRevurdering';
import { formatCurrency } from '~src/utils/format/formatUtils';

import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';
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
            gjeninnvilgelsesbegrunnelse: lagretMåned?.gjeninnvilgelsesbegrunnelse ?? null,
        };
    });
};

const Forsørgingstillegg = (props: Props & { grunnlag: HistoriskInfotrygdMånedsgrunnlag; onBekreftet: () => void }) => {
    const [bekreftStatus, bekreft] = useApiCall(bekreftHistoriskForsørgingstillegg);
    const berørteMåneder = props.grunnlag.måneder.filter((måned) => måned.kreverKontrollAvHistoriskForsørgingstillegg);

    if (
        !props.grunnlag.kreverKontrollAvHistoriskForsørgingstillegg ||
        props.grunnlag.harBekreftetKontrollAvHistoriskForsørgingstillegg
    ) {
        return null;
    }

    return (
        <Alert variant="warning">
            <VStack gap="4" align="start">
                <div>
                    <Heading level="2" size="small" spacing>
                        Kontroller mulig forsørgingstillegg
                    </Heading>
                    <BodyShort spacing>
                        Denne stønadsperioden startet før 1. januar 2015. Etter reglene som gjaldt da, kunne supplerende
                        stønad inneholde forsørgingstillegg for barn under 18 år. Historiske data viser ikke om det
                        utbetalte beløpet inneholdt et slikt tillegg.
                    </BodyShort>
                    <BodyShort>
                        Kontroller månedsbeløpene før du fortsetter. Du har ansvar for at beløpet som brukes som
                        tidligere utbetalt ytelse, er korrekt.
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
                {RemoteData.isFailure(bekreftStatus) && <HistoriskAlderssakApiErrorAlert error={bekreftStatus.error} />}
                <Button
                    type="button"
                    loading={RemoteData.isPending(bekreftStatus)}
                    onClick={() =>
                        bekreft(props.behandling.id, (behandling) => {
                            props.onOppdatert(behandling);
                            props.onBekreftet();
                        })
                    }
                >
                    Jeg har kontrollert månedsbeløpene og vurdert mulig forsørgingstillegg
                </Button>
            </VStack>
        </Alert>
    );
};

const HistoriskInfotrygdBeregning = (props: Props) => {
    const [grunnlagStatus, hentGrunnlag] = useApiCall(hentHistoriskInfotrygdMånedsgrunnlag);
    const [beregnStatus, beregn] = useApiCall(beregnHistoriskInfotrygdRevurdering);
    const [måneder, setMåneder] = useState<HistoriskInfotrygdBeregningsgrunnlagForMåned[]>([]);
    const [begrunnelse, setBegrunnelse] = useState(props.behandling.begrunnelse ?? '');
    const [valideringsfeil, setValideringsfeil] = useState<string>();

    const lastGrunnlag = () =>
        hentGrunnlag(props.behandling.id, (grunnlag) => {
            setMåneder(lagSkjemagrunnlag(grunnlag));
            setBegrunnelse(props.behandling.begrunnelse ?? '');
        });

    useEffect(() => {
        lastGrunnlag();
    }, [props.behandling.id]);

    const oppdaterMåned = (
        index: number,
        oppdater: (måned: HistoriskInfotrygdBeregningsgrunnlagForMåned) => HistoriskInfotrygdBeregningsgrunnlagForMåned,
    ) => setMåneder((gjeldende) => gjeldende.map((måned, i) => (i === index ? oppdater(måned) : måned)));

    const handleBeregn = () => {
        if (!begrunnelse.trim()) {
            setValideringsfeil('Skriv en begrunnelse for revurderingen.');
            return;
        }
        const ugyldigOpphør = måneder.some((måned) => måned.manueltOpphør && !måned.manueltOpphør.begrunnelse.trim());
        if (ugyldigOpphør) {
            setValideringsfeil('Alle manuelt valgte opphør må ha en begrunnelse.');
            return;
        }

        setValideringsfeil(undefined);
        beregn({ revurderingId: props.behandling.id, begrunnelse: begrunnelse.trim(), måneder }, (resultat) => {
            props.onOppdatert(resultat.behandling);
            lastGrunnlag();
        });
    };

    if (RemoteData.isInitial(grunnlagStatus) || RemoteData.isPending(grunnlagStatus)) {
        return <Loader title="Henter månedsgrunnlag" size="large" />;
    }
    if (RemoteData.isFailure(grunnlagStatus)) {
        return <HistoriskAlderssakApiErrorAlert error={grunnlagStatus.error} />;
    }

    const grunnlag = grunnlagStatus.value;
    const kanRedigeres = ['OPPRETTET', 'BEREGNET', 'UNDERKJENT'].includes(props.behandling.status);
    const kontrollMangler =
        grunnlag.kreverKontrollAvHistoriskForsørgingstillegg &&
        !grunnlag.harBekreftetKontrollAvHistoriskForsørgingstillegg;

    return (
        <VStack gap="6">
            <Forsørgingstillegg {...props} grunnlag={grunnlag} onBekreftet={lastGrunnlag} />
            <section aria-labelledby="månedsgrunnlag-tittel">
                <VStack gap="4">
                    <Heading id="månedsgrunnlag-tittel" level="2" size="medium">
                        Månedsgrunnlag
                    </Heading>
                    {måneder.map((måned, månedIndex) => {
                        const historisk = grunnlag.måneder[månedIndex];
                        const resultat = grunnlag.beregning?.måneder.find((m) => m.måned === måned.måned);
                        return (
                            <Box
                                key={måned.måned}
                                background="surface-subtle"
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
                                        {resultat && (
                                            <>
                                                <div>
                                                    <Label as="dt" size="small">
                                                        Nytt beløp
                                                    </Label>
                                                    <BodyShort as="dd">{formatCurrency(resultat.nyttBeløp)}</BodyShort>
                                                </div>
                                                <div>
                                                    <Label as="dt" size="small">
                                                        Differanse
                                                    </Label>
                                                    <BodyShort as="dd">{formatCurrency(resultat.differanse)}</BodyShort>
                                                </div>
                                            </>
                                        )}
                                    </dl>
                                    <Select
                                        label="Satskategori"
                                        value={måned.satskategori}
                                        readOnly={!kanRedigeres}
                                        onChange={(event) =>
                                            oppdaterMåned(månedIndex, (verdi) => ({
                                                ...verdi,
                                                satskategori: event.target.value as HistoriskInfotrygdSatskategori,
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
                                                            {Object.values(VelgbareFradragskategorier).map((type) => (
                                                                <option key={type} value={type}>
                                                                    {type}
                                                                </option>
                                                            ))}
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
                                                                                  tilhører: event.target.value as
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
                                                                            ? { ...f, beskrivelse: event.target.value }
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
                                                                              utenlandskInntekt: event.target.checked
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
                                                                value={fradrag.utenlandskInntekt.beløpIUtenlandskValuta}
                                                                readOnly={!kanRedigeres}
                                                                onChange={(event) =>
                                                                    oppdaterMåned(månedIndex, (verdi) => ({
                                                                        ...verdi,
                                                                        fradrag: verdi.fradrag.map((f, i) =>
                                                                            i === fradragIndex && f.utenlandskInntekt
                                                                                ? {
                                                                                      ...f,
                                                                                      utenlandskInntekt: {
                                                                                          ...f.utenlandskInntekt,
                                                                                          beløpIUtenlandskValuta:
                                                                                              Number(
                                                                                                  event.target.value,
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
                                                                            i === fradragIndex && f.utenlandskInntekt
                                                                                ? {
                                                                                      ...f,
                                                                                      utenlandskInntekt: {
                                                                                          ...f.utenlandskInntekt,
                                                                                          valuta: event.target.value,
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
                                                                            i === fradragIndex && f.utenlandskInntekt
                                                                                ? {
                                                                                      ...f,
                                                                                      utenlandskInntekt: {
                                                                                          ...f.utenlandskInntekt,
                                                                                          kurs: Number(
                                                                                              event.target.value,
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
                                    <Select
                                        label="Manuelt opphør"
                                        value={måned.manueltOpphør?.opphørsgrunn ?? ''}
                                        readOnly={!kanRedigeres}
                                        onChange={(event) =>
                                            oppdaterMåned(månedIndex, (verdi) => ({
                                                ...verdi,
                                                manueltOpphør: event.target.value
                                                    ? {
                                                          opphørsgrunn: event.target
                                                              .value as HistoriskInfotrygdManuellOpphørsgrunn,
                                                          begrunnelse: verdi.manueltOpphør?.begrunnelse ?? '',
                                                      }
                                                    : null,
                                            }))
                                        }
                                    >
                                        <option value="">Ikke manuelt opphør</option>
                                        {opphørsgrunner.map((grunn) => (
                                            <option key={grunn.value} value={grunn.value}>
                                                {grunn.label}
                                            </option>
                                        ))}
                                    </Select>
                                    {måned.manueltOpphør && (
                                        <Textarea
                                            label="Begrunnelse for opphør"
                                            value={måned.manueltOpphør.begrunnelse}
                                            readOnly={!kanRedigeres}
                                            onChange={(event) =>
                                                oppdaterMåned(månedIndex, (verdi) => ({
                                                    ...verdi,
                                                    manueltOpphør: verdi.manueltOpphør
                                                        ? { ...verdi.manueltOpphør, begrunnelse: event.target.value }
                                                        : null,
                                                }))
                                            }
                                        />
                                    )}
                                    <Textarea
                                        label="Begrunnelse for gjeninnvilgelse"
                                        description="Fylles ut når ytelsen innvilges igjen etter en opphørsperiode."
                                        value={måned.gjeninnvilgelsesbegrunnelse ?? ''}
                                        readOnly={!kanRedigeres}
                                        onChange={(event) =>
                                            oppdaterMåned(månedIndex, (verdi) => ({
                                                ...verdi,
                                                gjeninnvilgelsesbegrunnelse: event.target.value || null,
                                            }))
                                        }
                                    />
                                </VStack>
                            </Box>
                        );
                    })}
                    {kanRedigeres && (
                        <>
                            <Textarea
                                label="Begrunnelse for revurderingen"
                                value={begrunnelse}
                                onChange={(event) => setBegrunnelse(event.target.value)}
                                error={valideringsfeil}
                            />
                            {RemoteData.isFailure(beregnStatus) && (
                                <HistoriskAlderssakApiErrorAlert error={beregnStatus.error} />
                            )}
                            <Button
                                type="button"
                                loading={RemoteData.isPending(beregnStatus)}
                                disabled={kontrollMangler}
                                onClick={handleBeregn}
                            >
                                Lagre og beregn
                            </Button>
                        </>
                    )}
                    {grunnlag.beregning && (
                        <Alert variant="info">
                            Beregningen gir {grunnlag.beregning.økonomiskRetning.toLowerCase().replace('_', ' ')}.
                        </Alert>
                    )}
                </VStack>
            </section>
        </VStack>
    );
};

export default HistoriskInfotrygdBeregning;
