import { Label } from '@navikt/ds-react';

import { ErrorMessageAlert } from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useI18n } from '~src/lib/i18n';
import {
    Grunnlag,
    KjøretøySpesifisering,
    Skattegrunnlag,
    SkattegrunnlagForÅr,
    Stadie,
    StadieFeil,
    Årsgrunnlag,
} from '~src/types/skatt/Skatt';
import { formatDateTime } from '~src/utils/date/dateUtils';
import { erStadie, erStadieFeil } from '~src/utils/SkattUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import styles from './OppsummeringAvSkattegrunnlag.module.less';
import messages from './OppsummeringAvSkattegrunnlag-nb';

const OppsummeringAvSkattegrunnlag = (props: { skattegrunnlag: Skattegrunnlag }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <div className={styles.skattegrunnlagsInfoContainer}>
                <OppsummeringPar label={formatMessage('skattegrunnlag.fnr')} verdi={props.skattegrunnlag.fnr} />
                <OppsummeringPar
                    label={formatMessage('skattegrunnlag.tidspunktHentet')}
                    verdi={formatDateTime(props.skattegrunnlag.hentetTidspunkt)}
                />
                <hr />
            </div>
            {props.skattegrunnlag.årsgrunnlag.map((å) => (
                <div key={å.inntektsår} className={styles.årsgrunnlagContainer}>
                    <OppsummeringAvÅrsgrunnlag årsgrunnlag={å} />
                    <hr />
                </div>
            ))}
        </div>
    );
};

export default OppsummeringAvSkattegrunnlag;

const OppsummeringAvStadie = (props: { stadie: Stadie }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <OppsummeringPar label={formatMessage('årsgrunnlag.stadie')} verdi={props.stadie.stadie} />
            <OppsummeringAvGrunnlagsliste
                grunnlag={props.stadie.grunnlag}
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
const OppsummeringAvStadieFeil = (props: { feil: StadieFeil }) => {
    return (
        <div>
            <ErrorMessageAlert err={props.feil.error} />
        </div>
    );
};

const OppsummeringAvÅrsgrunnlag = (props: { årsgrunnlag: Årsgrunnlag }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <div className={styles.årsgrunnlaginformasjonContainer}>
                <OppsummeringPar label={formatMessage('årsgrunnlag.inntektsår')} verdi={props.årsgrunnlag.inntektsår} />
                {erStadie(props.årsgrunnlag) && <OppsummeringAvStadie stadie={props.årsgrunnlag} />}
                {erStadieFeil(props.årsgrunnlag) && <OppsummeringAvStadieFeil feil={props.årsgrunnlag} />}
            </div>
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

const OppsummeringAvGrunnlagsliste = (props: { grunnlag: SkattegrunnlagForÅr; felter: Grunnlagsfelt[] }) => {
    const { formatMessage } = useI18n({ messages });
    if (props.felter.length === 0) {
        return <div>Teknisk feil: Må spesifisere hvilke felter som skal vises</div>;
    }

    return (
        <div className={styles.grunnlagslisteContainer}>
            <OppsummeringPar
                label={formatMessage('årsgrunnlag.skatteoppgjørsdato')}
                verdi={
                    props.grunnlag.oppgjørsdato
                        ? props.grunnlag.oppgjørsdato
                        : formatMessage('årsgrunnlag.skatteoppgjørsdato.finnesIkke')
                }
            />
            {props.felter.includes('formue') &&
                props.grunnlag.formue.map((f) => (
                    <OppsummeringAvGrunnlag
                        key={`${f.navn}-${f.beløp}`}
                        grunnlag={f}
                        tittel={formatMessage('grunnlagstype.formue')}
                    />
                ))}
            {props.felter.includes('inntekt') &&
                props.grunnlag.inntekt.map((i) => (
                    <OppsummeringAvGrunnlag
                        key={`${i.navn}-${i.beløp}`}
                        grunnlag={i}
                        tittel={formatMessage('grunnlagstype.inntekt')}
                    />
                ))}
            {props.felter.includes('inntektsfradrag') &&
                props.grunnlag.inntektsfradrag.map((ifr) => (
                    <OppsummeringAvGrunnlag
                        key={`${ifr.navn}-${ifr.beløp}`}
                        grunnlag={ifr}
                        tittel={formatMessage('grunnlagstype.inntektsfradrag')}
                    />
                ))}
            {props.felter.includes('formuesfradrag') &&
                props.grunnlag.formuesfradrag.map((ff) => (
                    <OppsummeringAvGrunnlag
                        key={`${ff.navn}-${ff.beløp}`}
                        grunnlag={ff}
                        tittel={formatMessage('grunnlagstype.formuesfradrag')}
                    />
                ))}
            {props.felter.includes('verdsettingsrabattSomGirGjeldsreduksjon') &&
                props.grunnlag.verdsettingsrabattSomGirGjeldsreduksjon.map((vsr) => (
                    <OppsummeringAvGrunnlag
                        key={`${vsr.navn}-${vsr.beløp}`}
                        grunnlag={vsr}
                        tittel={formatMessage('grunnlagstype.verdsettingsrabattSomGirGjeldsreduksjon')}
                    />
                ))}
            {props.felter.includes('oppjusteringAvEierinntekter') &&
                props.grunnlag.oppjusteringAvEierinntekter.map((oaei) => (
                    <OppsummeringAvGrunnlag
                        key={`${oaei.navn}-${oaei.beløp}`}
                        grunnlag={oaei}
                        tittel={formatMessage('grunnlagstype.oppjusteringAvEierinntekter')}
                    />
                ))}
            {props.felter.includes('annet') &&
                props.grunnlag.annet.map((a) => (
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
    } catch {
        return id;
    }
};
