import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Button, Heading, Loader, Select, VStack } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import {
    beregnHistoriskInfotrygdRevurdering,
    hentHistoriskInfotrygdMånedsgrunnlag,
} from '~src/api/historiskAlderssakApi';
import { useApiCall } from '~src/lib/hooks';
import {
    HistoriskInfotrygdBeregningsgrunnlagForMåned,
    HistoriskInfotrygdLagretBeregning,
    HistoriskInfotrygdManuellOpphørsgrunn,
    HistoriskInfotrygdMånedsgrunnlag,
    HistoriskInfotrygdMånedsutkast,
    HistoriskInfotrygdRevurdering,
} from '~src/types/HistoriskInfotrygdRevurdering';
import { formatMonthYear, parseNonNullableIsoDateOnly } from '~src/utils/date/dateUtils';
import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';
import HistoriskInfotrygdBeregningsresultat from './HistoriskInfotrygdBeregningsresultat';
import HistoriskInfotrygdForsørgingstillegg from './HistoriskInfotrygdForsørgingstillegg';
import HistoriskInfotrygdMåned from './HistoriskInfotrygdMåned';
import HistoriskInfotrygdOpphør from './HistoriskInfotrygdOpphør';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    onOppdatert: (behandling: HistoriskInfotrygdRevurdering) => void;
}

const lagMånedsutkastForRevurdering = (grunnlag: HistoriskInfotrygdMånedsgrunnlag) => {
    const lagredeBeregningsmåneder = new Map(
        grunnlag.lagretBeregningINåværendeRevurdering?.måneder.map((måned) => [måned.måned, måned]),
    );

    return grunnlag.vedtaksgrunnlagSomRevurderes.map<HistoriskInfotrygdMånedsutkast>((historiskMåned) => {
        const lagretBeregningsmåned = lagredeBeregningsmåneder.get(historiskMåned.måned);
        return {
            måned: historiskMåned.måned,
            bosituasjon:
                lagretBeregningsmåned?.bosituasjon ??
                (historiskMåned.resultat === 'YTELSE' ? historiskMåned.foreslåttBosituasjon : null),
            fradrag: lagretBeregningsmåned?.fradrag ?? [],
            manueltOpphør: lagretBeregningsmåned?.manueltOpphør ?? null,
        };
    });
};

const finnMånederMedHistoriskeFradragMenIngenNye = (
    grunnlag: HistoriskInfotrygdMånedsgrunnlag,
    nyeMånedsutkast: HistoriskInfotrygdMånedsutkast[],
): string[] => {
    const månederFørRevurdering = grunnlag.vedtaksgrunnlagSomRevurderes;

    return månederFørRevurdering
        .filter((månedFørRevurdering) => {
            const haddeFradrag = månedFørRevurdering.resultat === 'YTELSE' && månedFørRevurdering.samletFradrag > 0;
            if (!haddeFradrag) {
                return false;
            }

            const nyttMånedsutkast = nyeMånedsutkast.find((utkast) => utkast.måned === månedFørRevurdering.måned);

            return nyttMånedsutkast !== undefined && nyttMånedsutkast.fradrag.length === 0;
        })
        .map((månedFørRevurdering) => månedFørRevurdering.måned);
};

const HistoriskInfotrygdBeregning = (props: Props) => {
    const [grunnlagStatus, hentGrunnlag] = useApiCall(hentHistoriskInfotrygdMånedsgrunnlag);
    const [beregnStatus, beregn] = useApiCall(beregnHistoriskInfotrygdRevurdering);
    // Redigerbart utkast for denne revurderingen. Historiske fradrag kopieres ikke inn;
    // fradrag hentes fra en lagret beregning på revurderingen, ellers starter listen tom.
    const [månedsutkast, setMånedsutkast] = useState<HistoriskInfotrygdMånedsutkast[]>([]);
    const [beregningEtterLagring, setBeregningEtterLagring] = useState<HistoriskInfotrygdLagretBeregning | null>(null);
    const [månederMedFradragsvarsel, setMånederMedFradragsvarsel] = useState<string[]>([]);
    const [valideringsfeil, setValideringsfeil] = useState<string>();
    const [resultatForPerioden, setResultatForPerioden] = useState<'YTELSE' | 'OPPHØR'>('YTELSE');
    const [opphørsgrunnForPerioden, setOpphørsgrunnForPerioden] =
        useState<HistoriskInfotrygdManuellOpphørsgrunn | null>(null);

    const lastMånedsgrunnlag = () =>
        hentGrunnlag(props.behandling.id, (grunnlag) => {
            setMånedsutkast(lagMånedsutkastForRevurdering(grunnlag));
            const lagretOpphør = grunnlag.lagretBeregningINåværendeRevurdering?.måneder.find(
                (måned) => måned.manueltOpphør,
            )?.manueltOpphør;
            setResultatForPerioden(lagretOpphør ? 'OPPHØR' : 'YTELSE');
            setOpphørsgrunnForPerioden(lagretOpphør?.opphørsgrunn ?? null);
        });

    useEffect(() => {
        setMånederMedFradragsvarsel([]);
        lastMånedsgrunnlag();
    }, [props.behandling.id]);

    const oppdaterMåned = (
        index: number,
        oppdater: (måned: HistoriskInfotrygdMånedsutkast) => HistoriskInfotrygdMånedsutkast,
    ) => setMånedsutkast((gjeldende) => gjeldende.map((måned, i) => (i === index ? oppdater(måned) : måned)));

    const nullstillFradragsvarsel = () => {
        setMånederMedFradragsvarsel([]);
    };

    const handleBeregn = () => {
        setMånederMedFradragsvarsel([]);
        const månederMedBosituasjon = månedsutkast.filter(
            (
                måned,
            ): måned is HistoriskInfotrygdMånedsutkast & {
                bosituasjon: NonNullable<HistoriskInfotrygdMånedsutkast['bosituasjon']>;
            } => måned.bosituasjon !== null,
        );
        if (månederMedBosituasjon.length !== månedsutkast.length) {
            setValideringsfeil('Velg bosituasjon for hver måned før du beregner.');
            return;
        }
        if (resultatForPerioden === 'OPPHØR' && !opphørsgrunnForPerioden) {
            setValideringsfeil('Velg opphørsgrunn for hele perioden.');
            return;
        }

        setValideringsfeil(undefined);
        const beregningsmåneder: HistoriskInfotrygdBeregningsgrunnlagForMåned[] = månederMedBosituasjon.map(
            (måned) => ({
                måned: måned.måned,
                bosituasjon: måned.bosituasjon,
                fradrag: måned.fradrag,
                manueltOpphør:
                    resultatForPerioden === 'OPPHØR' && opphørsgrunnForPerioden
                        ? { opphørsgrunn: opphørsgrunnForPerioden }
                        : null,
            }),
        );

        setMånederMedFradragsvarsel(finnMånederMedHistoriskeFradragMenIngenNye(grunnlag, månedsutkast));

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
    const vedtaksgrunnlagSomRevurderes = grunnlag.vedtaksgrunnlagSomRevurderes;
    const beregning = beregningEtterLagring ?? grunnlag.lagretBeregningINåværendeRevurdering;
    const kanRedigeres = ['OPPRETTET', 'BEREGNET', 'UNDERKJENT'].includes(props.behandling.status);

    return (
        <VStack gap="6">
            <HistoriskInfotrygdForsørgingstillegg grunnlag={grunnlag} />
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
                            nullstillFradragsvarsel();
                        }}
                    >
                        <option value="YTELSE">Ytelse</option>
                        <option value="OPPHØR">Opphør</option>
                    </Select>
                    {resultatForPerioden === 'OPPHØR' && (
                        <HistoriskInfotrygdOpphør
                            opphørsgrunnForPerioden={opphørsgrunnForPerioden}
                            kanRedigeres={kanRedigeres}
                            valideringsfeil={valideringsfeil}
                            setOpphørsgrunnForPerioden={(opphørsgrunn) => {
                                setOpphørsgrunnForPerioden(opphørsgrunn);
                                nullstillFradragsvarsel();
                            }}
                            setValideringsfeil={setValideringsfeil}
                        />
                    )}
                    {valideringsfeil && resultatForPerioden === 'YTELSE' && (
                        <Alert variant="error">{valideringsfeil}</Alert>
                    )}
                </VStack>
            </section>
            <section aria-labelledby="månedsgrunnlag-tittel">
                <VStack gap="4">
                    <Heading id="månedsgrunnlag-tittel" level="2" size="medium">
                        Månedsgrunnlag
                    </Heading>
                    {månedsutkast.map((månedsutkast, månedIndex) => {
                        const vedtaksgrunnlagForMåned = vedtaksgrunnlagSomRevurderes[månedIndex];
                        return (
                            <HistoriskInfotrygdMåned
                                key={månedsutkast.måned}
                                måned={månedsutkast}
                                vedtaksgrunnlag={vedtaksgrunnlagForMåned}
                                kanRedigeres={kanRedigeres}
                                resultatForPerioden={resultatForPerioden}
                                opphørsgrunnForPerioden={opphørsgrunnForPerioden}
                                onOppdatert={(oppdater) => {
                                    oppdaterMåned(månedIndex, oppdater);
                                    setValideringsfeil(undefined);
                                    nullstillFradragsvarsel();
                                }}
                            />
                        );
                    })}
                    {månederMedFradragsvarsel.length > 0 && (
                        <Alert variant="warning">
                            <VStack gap="2">
                                <BodyShort weight="semibold">
                                    Vedtaket som revurderes har fradrag, men du har ikke registrert fradrag i denne
                                    revurderingen.
                                </BodyShort>
                                <BodyShort>Dette gjelder følgende måneder og år:</BodyShort>
                                <ul>
                                    {månederMedFradragsvarsel.map((måned) => (
                                        <li key={måned}>
                                            {formatMonthYear(parseNonNullableIsoDateOnly(`${måned}-01`))}
                                        </li>
                                    ))}
                                </ul>
                            </VStack>
                        </Alert>
                    )}
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
            {beregning && <HistoriskInfotrygdBeregningsresultat grunnlag={grunnlag} beregning={beregning} />}
        </VStack>
    );
};

export default HistoriskInfotrygdBeregning;
