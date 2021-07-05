import { hentBosituasjongrunnlag } from '~features/revurdering/revurderingUtils';
import { DelerBoligMed } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import { Behandlingsinformasjon, FormueStatus, FormueVerdier } from '~types/Behandlingsinformasjon';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnhold } from '~types/Søknad';

export interface FormDataVerdier {
    verdiPåBolig: string;
    verdiPåEiendom: string;
    verdiPåKjøretøy: string;
    innskuddsbeløp: string;
    verdipapir: string;
    stårNoenIGjeldTilDeg: string;
    kontanterOver1000: string;
    depositumskonto: string;
}

export interface FormueFormData {
    status: FormueStatus;
    epsFnr: Nullable<string>;
    verdier: Nullable<FormDataVerdier>;
    borSøkerMedEPS: boolean;
    epsVerdier: Nullable<FormDataVerdier>;
    begrunnelse: Nullable<string>;
}

export const keyNavnForFormue: Array<keyof FormDataVerdier> = [
    'verdiPåBolig',
    'verdiPåEiendom',
    'verdiPåKjøretøy',
    'innskuddsbeløp',
    'verdipapir',
    'stårNoenIGjeldTilDeg',
    'kontanterOver1000',
    'depositumskonto',
];

export function totalVerdiKjøretøy(kjøretøyArray: Array<{ verdiPåKjøretøy: number; kjøretøyDeEier: string }>) {
    return kjøretøyArray.reduce((acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy, 0);
}

export function kalkulerFormueFraSøknad(f: SøknadInnhold['formue']) {
    return [
        f.verdiPåBolig ?? 0,
        f.verdiPåEiendom ?? 0,
        totalVerdiKjøretøy(f.kjøretøy ?? []),
        Math.max((f.innskuddsBeløp ?? 0) - (f.depositumsBeløp ?? 0), 0),
        f.verdipapirBeløp ?? 0,
        f.skylderNoenMegPengerBeløp ?? 0,
        f.kontanterBeløp ?? 0,
    ].reduce((acc, formue) => acc + formue, 0);
}

export function getFormueInitialValues(
    behandlingsInfo: Behandlingsinformasjon,
    søknadsInnhold: SøknadInnhold,
    grunnlagsdata: GrunnlagsdataOgVilkårsvurderinger
) {
    const behandlingsFormue = behandlingsInfo.formue;

    return {
        verdier: getInitialVerdier(behandlingsInfo.formue?.verdier ?? null, søknadsInnhold.formue),
        epsVerdier: getInitialVerdier(
            behandlingsInfo.formue?.epsVerdier ?? null,
            søknadsInnhold.ektefelle?.formue ?? null
        ),
        status: behandlingsFormue?.status ?? FormueStatus.VilkårOppfylt,
        begrunnelse: behandlingsFormue?.begrunnelse ?? null,
        borSøkerMedEPS:
            behandlingsFormue?.borSøkerMedEPS ??
            søknadsInnhold.boforhold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
        epsFnr:
            hentBosituasjongrunnlag(grunnlagsdata)?.fnr ??
            søknadsInnhold.boforhold.ektefellePartnerSamboer?.fnr ??
            null,
    };
}

export function getInitialVerdier(
    verdier: Nullable<FormueVerdier>,
    søknadsFormue: Nullable<SøknadInnhold['formue']>
): FormDataVerdier {
    return {
        verdiPåBolig: (verdier?.verdiIkkePrimærbolig ?? søknadsFormue?.verdiPåBolig ?? 0).toString(),
        verdiPåEiendom: (verdier?.verdiEiendommer ?? søknadsFormue?.verdiPåEiendom ?? 0).toString(),
        verdiPåKjøretøy: (verdier?.verdiKjøretøy ?? totalVerdiKjøretøy(søknadsFormue?.kjøretøy ?? []) ?? 0).toString(),
        innskuddsbeløp: (
            verdier?.innskudd ?? (søknadsFormue?.innskuddsBeløp ?? 0) + (søknadsFormue?.depositumsBeløp ?? 0)
        ).toString(),
        verdipapir: (verdier?.verdipapir ?? søknadsFormue?.verdipapirBeløp ?? 0).toString(),
        stårNoenIGjeldTilDeg: (verdier?.pengerSkyldt ?? søknadsFormue?.skylderNoenMegPengerBeløp ?? 0).toString(),
        kontanterOver1000: (verdier?.kontanter ?? søknadsFormue?.kontanterBeløp ?? 0).toString(),
        depositumskonto: (verdier?.depositumskonto ?? søknadsFormue?.depositumsBeløp ?? 0).toString(),
    };
}

export const formDataVerdierTilFormueVerdier = (verdier: FormDataVerdier): FormueVerdier => {
    const parsedVerdier = Object.fromEntries(
        Object.entries(verdier).map((verdi) => [verdi[0], Number.parseInt(verdi[1], 10)])
    );

    return {
        verdiIkkePrimærbolig: parsedVerdier.verdiPåBolig,
        verdiEiendommer: parsedVerdier.verdiPåEiendom,
        verdiKjøretøy: parsedVerdier.verdiPåKjøretøy,
        innskudd: parsedVerdier.innskuddsbeløp,
        verdipapir: parsedVerdier.verdipapir,
        pengerSkyldt: parsedVerdier.stårNoenIGjeldTilDeg,
        kontanter: parsedVerdier.kontanterOver1000,
        depositumskonto: parsedVerdier.depositumskonto,
    };
};

export function regnUtFormueVerdier(verdier: Nullable<FormueVerdier>) {
    if (!verdier) {
        return 0;
    }

    const keyNavnForFormueVerdier: Array<keyof FormueVerdier> = [
        'verdiIkkePrimærbolig',
        'verdiEiendommer',
        'verdiKjøretøy',
        'innskudd',
        'verdipapir',
        'pengerSkyldt',
        'kontanter',
        'depositumskonto',
    ];

    const formuer = keyNavnForFormueVerdier
        .filter((keyNavn) => keyNavn !== 'depositumskonto')
        .map((keyNavn) => {
            if (keyNavn === 'innskudd') {
                return Math.max((verdier?.innskudd ?? 0) - (verdier?.depositumskonto ?? 0), 0);
            }
            return verdier[keyNavn];
        }) as number[];

    return formuer.reduce((acc, formue) => acc + formue, 0);
}
