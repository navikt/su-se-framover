import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Heading, Label } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useMemo } from 'react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';
import { hentSkattegrunnlag } from '~src/features/SøknadsbehandlingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { useAppSelector } from '~src/redux/Store';
import { Grunnlag, Grunnlagsliste, KjøretøySpesifisering, Årsgrunnlag } from '~src/types/skatt/Skatt';
import { erSkattegrunnlag, erSkatteOppslagsFeil } from '~src/utils/SkattUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvSkattegrunnlag-nb';
import styles from './OppsummeringAvSkattegrunnlag.module.less';

/**
 * TODO: komponenten før bare ta inn skattegrunnlaget, og vise den og henting av data bør gjøres på utsiden
 */
const OppsummeringAvSkattegrunnlag = (props: { behandlingId: string }) => {
    const { formatMessage } = useI18n({ messages });
    const skattedataFraStore = useAppSelector((state) => state.sak.skattedata);
    const [status, hentSkattedata] = useAsyncActionCreator(hentSkattegrunnlag);

    const skattedataFraStoreEllerApiKall = useMemo(() => {
        const behandlingensSkattedataFraStore = skattedataFraStore.find(
            (data) => data.behandlingId === props.behandlingId
        );
        if (behandlingensSkattedataFraStore) {
            return RemoteData.success({
                skatteoppslagEps: behandlingensSkattedataFraStore.skatteoppslagEps,
                skatteoppslagSøker: behandlingensSkattedataFraStore.skatteoppslagSøker,
            });
        }
        if (RemoteData.isInitial(status)) {
            hentSkattedata({ behandlingId: props.behandlingId });
        }
        return status;
    }, [status]);

    return (
        <div>
            <Heading level="2" size="medium">
                {formatMessage('skattegrunnlag.tittel')}
            </Heading>

            {pipe(
                skattedataFraStoreEllerApiKall,
                RemoteData.fold(
                    () => <p>null</p>,
                    () => <SpinnerMedTekst text={formatMessage('skattegrunnlag.laster.søker')} />,
                    (err) => <ApiErrorAlert error={err} />,
                    (skatteoppslag) => (
                        <div className={styles.skattegrunnlagsInformasjonContainer}>
                            {erSkatteOppslagsFeil(skatteoppslag.skatteoppslagSøker) && (
                                <div>
                                    <BodyShort>Feil ved henting av skattedata</BodyShort>
                                    <BodyShort>{skatteoppslag.skatteoppslagSøker.httpCode.value}</BodyShort>
                                    <BodyShort>{skatteoppslag.skatteoppslagSøker.httpCode.description}</BodyShort>
                                </div>
                            )}

                            {erSkattegrunnlag(skatteoppslag.skatteoppslagSøker) && (
                                <div className={styles.årsgrunnlagMedTittelContainer}>
                                    <Heading level="2" size="small">
                                        {formatMessage('skattegrunnlag.søker')}
                                    </Heading>
                                    {skatteoppslag.skatteoppslagSøker.årsgrunnlag.map((å) => (
                                        <OppsummeringAvÅrsgrunnlag key={å.inntektsår} årsgrunnlag={å} />
                                    ))}
                                </div>
                            )}

                            {erSkatteOppslagsFeil(skatteoppslag.skatteoppslagEps) && (
                                <div>
                                    <BodyShort>Feil ved henting av skattedata</BodyShort>
                                    <BodyShort>{skatteoppslag.skatteoppslagEps.httpCode.value}</BodyShort>
                                    <BodyShort>{skatteoppslag.skatteoppslagEps.httpCode.description}</BodyShort>
                                    <BodyShort>TODO: serialisering i backend fjerner original feil</BodyShort>
                                </div>
                            )}

                            {erSkattegrunnlag(skatteoppslag.skatteoppslagEps) && (
                                <div className={styles.årsgrunnlagMedTittelContainer}>
                                    <Heading level="2" size="small">
                                        {formatMessage('skattegrunnlag.søker')}
                                    </Heading>
                                    {skatteoppslag.skatteoppslagEps.årsgrunnlag.map((å) => (
                                        <OppsummeringAvÅrsgrunnlag key={å.inntektsår} årsgrunnlag={å} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                )
            )}
        </div>
    );
};

export default OppsummeringAvSkattegrunnlag;

const OppsummeringAvÅrsgrunnlag = (props: { årsgrunnlag: Årsgrunnlag }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <div className={styles.årsgrunnlaginformasjonContainer}>
                <OppsummeringPar label={formatMessage('årsgrunnlag.inntektsår')} verdi={props.årsgrunnlag.inntektsår} />
                <OppsummeringPar label={formatMessage('årsgrunnlag.stadie')} verdi={props.årsgrunnlag.stadie} />
                <OppsummeringPar
                    label={formatMessage('årsgrunnlag.skatteoppgjørsdato')}
                    verdi={
                        props.årsgrunnlag.skatteoppgjørsdato
                            ? props.årsgrunnlag.skatteoppgjørsdato.toDateString()
                            : formatMessage('årsgrunnlag.skatteoppgjørsdato.finnesIkke')
                    }
                />
            </div>
            <OppsummeringAvGrunnlagsliste
                grunnlagsliste={props.årsgrunnlag.grunnlag}
                felter={[
                    'formue',
                    'inntekt',
                    'inntektsfradrag',
                    'formuesfradrag',
                    'verdsettingsrabattSomGirGjeldsreduksjon',
                    'oppjusteringAvEierinntekter',
                    'annet',
                ]}
            />
        </div>
    );
};

type Grunnlagsfelt =
    | 'formue'
    | 'inntekt'
    | 'inntektsfradrag'
    | 'formuesfradrag'
    | 'verdsettingsrabattSomGirGjeldsreduksjon'
    | 'oppjusteringAvEierinntekter'
    | 'annet';

const OppsummeringAvGrunnlagsliste = (props: { grunnlagsliste: Grunnlagsliste; felter: Grunnlagsfelt[] }) => {
    const { formatMessage } = useI18n({ messages });
    if (props.felter.length === 0) {
        return <div>Teknisk feil: Må spesifisere hvilke felter som skal vises</div>;
    }

    return (
        <div className={styles.grunnlagslisteContainer}>
            {props.felter.includes('formue') &&
                props.grunnlagsliste.formue.map((f) => (
                    <OppsummeringAvGrunnlag
                        key={`${f.navn}-${f.beløp}`}
                        grunnlag={f}
                        tittel={formatMessage('grunnlagstype.formue')}
                    />
                ))}
            {props.felter.includes('inntekt') &&
                props.grunnlagsliste.inntekt.map((i) => (
                    <OppsummeringAvGrunnlag
                        key={`${i.navn}-${i.beløp}`}
                        grunnlag={i}
                        tittel={formatMessage('grunnlagstype.inntekt')}
                    />
                ))}
            {props.felter.includes('inntektsfradrag') &&
                props.grunnlagsliste.inntektsfradrag.map((ifr) => (
                    <OppsummeringAvGrunnlag
                        key={`${ifr.navn}-${ifr.beløp}`}
                        grunnlag={ifr}
                        tittel={formatMessage('grunnlagstype.inntektsfradrag')}
                    />
                ))}
            {props.felter.includes('formuesfradrag') &&
                props.grunnlagsliste.formuesfradrag.map((ff) => (
                    <OppsummeringAvGrunnlag
                        key={`${ff.navn}-${ff.beløp}`}
                        grunnlag={ff}
                        tittel={formatMessage('grunnlagstype.formuesfradrag')}
                    />
                ))}
            {props.felter.includes('verdsettingsrabattSomGirGjeldsreduksjon') &&
                props.grunnlagsliste.verdsettingsrabattSomGirGjeldsreduksjon.map((vsr) => (
                    <OppsummeringAvGrunnlag
                        key={`${vsr.navn}-${vsr.beløp}`}
                        grunnlag={vsr}
                        tittel={formatMessage('grunnlagstype.verdsettingsrabattSomGirGjeldsreduksjon')}
                    />
                ))}
            {props.felter.includes('oppjusteringAvEierinntekter') &&
                props.grunnlagsliste.oppjusteringAvEierinntekter.map((oaei) => (
                    <OppsummeringAvGrunnlag
                        key={`${oaei.navn}-${oaei.beløp}`}
                        grunnlag={oaei}
                        tittel={formatMessage('grunnlagstype.oppjusteringAvEierinntekter')}
                    />
                ))}
            {props.felter.includes('annet') &&
                props.grunnlagsliste.annet.map((a) => (
                    <OppsummeringAvGrunnlag key={'a'} grunnlag={a} tittel={formatMessage('grunnlagstype.annet')} />
                ))}
        </div>
    );
};

const OppsummeringAvGrunnlag = (props: { grunnlag: Grunnlag; tittel: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Label>{props.tittel}</Label>
            <div className={styles.grunnlagsinformasjonContainer}>
                <OppsummeringPar
                    label={formatSkattTekniskMessage(props.grunnlag.navn, formatMessage)}
                    verdi={props.grunnlag.beløp}
                />
                {props.grunnlag.spesifisering.map((kjs) => (
                    <OppsummeringAvKjøretøySpesifisering key={kjs.registreringsnummer} kjøretøySpesifisering={kjs} />
                ))}
            </div>
        </div>
    );
};

const OppsummeringAvKjøretøySpesifisering = (props: { kjøretøySpesifisering: KjøretøySpesifisering }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <OppsummeringPar
                label={formatMessage('kjøretøySpesifisering.antattMarkedsverdi')}
                verdi={
                    props.kjøretøySpesifisering.antattMarkedsverdi
                        ? props.kjøretøySpesifisering.antattMarkedsverdi
                        : formatMessage('kjøretøySpesifisering.verdiFinnesIkke')
                }
            />
            <OppsummeringPar
                label={formatMessage('kjøretøySpesifisering.antattVerdiSomNytt')}
                verdi={
                    props.kjøretøySpesifisering.antattVerdiSomNytt
                        ? props.kjøretøySpesifisering.antattVerdiSomNytt
                        : formatMessage('kjøretøySpesifisering.verdiFinnesIkke')
                }
            />
            <OppsummeringPar
                label={formatMessage('kjøretøySpesifisering.beløp')}
                verdi={
                    props.kjøretøySpesifisering.beløp
                        ? props.kjøretøySpesifisering.beløp
                        : formatMessage('kjøretøySpesifisering.verdiFinnesIkke')
                }
            />
            <OppsummeringPar
                label={formatMessage('kjøretøySpesifisering.fabrikatnavn')}
                verdi={
                    props.kjøretøySpesifisering.fabrikatnavn
                        ? props.kjøretøySpesifisering.fabrikatnavn
                        : formatMessage('kjøretøySpesifisering.verdiFinnesIkke')
                }
            />
            <OppsummeringPar
                label={formatMessage('kjøretøySpesifisering.formuesverdi')}
                verdi={
                    props.kjøretøySpesifisering.formuesverdi
                        ? props.kjøretøySpesifisering.formuesverdi
                        : formatMessage('kjøretøySpesifisering.verdiFinnesIkke')
                }
            />
            <OppsummeringPar
                label={formatMessage('kjøretøySpesifisering.registreringsnummer')}
                verdi={
                    props.kjøretøySpesifisering.registreringsnummer
                        ? props.kjøretøySpesifisering.registreringsnummer
                        : formatMessage('kjøretøySpesifisering.verdiFinnesIkke')
                }
            />
            <OppsummeringPar
                label={formatMessage('kjøretøySpesifisering.årForFørstegangsregistrering')}
                verdi={
                    props.kjøretøySpesifisering.årForFørstegangsregistrering
                        ? props.kjøretøySpesifisering.årForFørstegangsregistrering
                        : formatMessage('kjøretøySpesifisering.verdiFinnesIkke')
                }
            />
        </div>
    );
};

// Hjelpefunksjon for å håndtere att vi får ukjente tekniske navn på formue / inntekt fra skatteetaten
const formatSkattTekniskMessage = (id: string, formatMessage: (id: keyof typeof messages) => string) => {
    try {
        return formatMessage(id as keyof typeof messages);
    } catch (e) {
        return id;
    }
};

/*
const SkatteApiFeilmelding = ({ tittel, error }: { tittel: string; error: ApiError | undefined }) => (
    <div>
        <Label className={styles.overskrift} spacing>
            {tittel}
        </Label>
        <ApiErrorAlert error={error} />
    </div>
);
*/
