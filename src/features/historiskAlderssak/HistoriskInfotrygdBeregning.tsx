import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader, Select, VStack } from '@navikt/ds-react';
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
import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';
import HistoriskInfotrygdBeregningsresultat from './HistoriskInfotrygdBeregningsresultat';
import HistoriskInfotrygdForsørgingstillegg from './HistoriskInfotrygdForsørgingstillegg';
import HistoriskInfotrygdMåned from './HistoriskInfotrygdMåned';
import HistoriskInfotrygdOpphør from './HistoriskInfotrygdOpphør';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    onOppdatert: (behandling: HistoriskInfotrygdRevurdering) => void;
}

const lagSkjemagrunnlag = (grunnlag: HistoriskInfotrygdMånedsgrunnlag) => {
    const lagret = new Map(grunnlag.beregning?.måneder.map((måned) => [måned.måned, måned]));

    return grunnlag.måneder.map<HistoriskInfotrygdMånedsutkast>((måned) => {
        const lagretMåned = lagret.get(måned.måned);
        return {
            måned: måned.måned,
            bosituasjon: lagretMåned?.bosituasjon ?? måned.foreslåttBosituasjon,
            fradrag: lagretMåned?.fradrag ?? [],
            manueltOpphør: lagretMåned?.manueltOpphør ?? null,
        };
    });
};

const HistoriskInfotrygdBeregning = (props: Props) => {
    const [grunnlagStatus, hentGrunnlag] = useApiCall(hentHistoriskInfotrygdMånedsgrunnlag);
    const [beregnStatus, beregn] = useApiCall(beregnHistoriskInfotrygdRevurdering);
    const [måneder, setMåneder] = useState<HistoriskInfotrygdMånedsutkast[]>([]);
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
        oppdater: (måned: HistoriskInfotrygdMånedsutkast) => HistoriskInfotrygdMånedsutkast,
    ) => setMåneder((gjeldende) => gjeldende.map((måned, i) => (i === index ? oppdater(måned) : måned)));

    const handleBeregn = () => {
        const månederMedBosituasjon = måneder.filter(
            (
                måned,
            ): måned is HistoriskInfotrygdMånedsutkast & {
                bosituasjon: NonNullable<HistoriskInfotrygdMånedsutkast['bosituasjon']>;
            } => måned.bosituasjon !== null,
        );
        if (månederMedBosituasjon.length !== måneder.length) {
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
                            setOpphørsgrunnForPerioden={setOpphørsgrunnForPerioden}
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
                    {måneder.map((måned, månedIndex) => {
                        const historisk = grunnlag.måneder[månedIndex];
                        return (
                            <HistoriskInfotrygdMåned
                                key={måned.måned}
                                måned={måned}
                                historisk={historisk}
                                kanRedigeres={kanRedigeres}
                                resultatForPerioden={resultatForPerioden}
                                opphørsgrunnForPerioden={opphørsgrunnForPerioden}
                                onOppdatert={(oppdater) => {
                                    oppdaterMåned(månedIndex, oppdater);
                                    setValideringsfeil(undefined);
                                }}
                            />
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
            {beregning && <HistoriskInfotrygdBeregningsresultat grunnlag={grunnlag} beregning={beregning} />}
        </VStack>
    );
};

export default HistoriskInfotrygdBeregning;
