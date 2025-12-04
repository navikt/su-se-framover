import * as DateFns from 'date-fns';
import { getEq } from 'fp-ts/Array';
import * as B from 'fp-ts/lib/boolean';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup, { validateStringAsNonNegativeNumber, validerPeriodeTomEtterFom } from '~src/lib/validering';
import {
    Bosituasjon,
    bosituasjonPåDato,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import {
    FormuegrunnlagVerdier,
    FormuegrunnlagVerdierRequest,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuegrunnlag';
import {
    Formuegrenser,
    FormueStatus,
    FormueVilkår,
    FormueVilkårRequest,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { eqNullableDatePeriode, NullablePeriode, Periode } from '~src/types/Periode';
import { SøknadInnhold } from '~src/types/Søknadinnhold';
import { lagTomPeriode, periodeTilIsoDateString } from '~src/utils/periode/periodeUtils';
import {
    hentBosituasjongrunnlag,
    hentOmSøkerBorMedEpsOgEpsFnr,
} from '~src/utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

export interface FormueVilkårFormData {
    formue: FormuegrunnlagFormData[];
}

//Pga validering og snacks, sniker man inn epsFnr for hvert tilhørende grunnlag for å sjekke om utfylling av EPS formue skal gjøres eller ikke
export interface FormuegrunnlagFormData {
    epsFnr: Nullable<string>;
    periode: NullablePeriode;
    søkersFormue: FormuegrunnlagVerdierFormData;
    epsFormue: Nullable<FormuegrunnlagVerdierFormData>;
    måInnhenteMerInformasjon: boolean;
}

export interface FormuegrunnlagVerdierFormData {
    verdiIkkePrimærbolig: string;
    verdiEiendommer: string;
    verdiKjøretøy: string;
    innskudd: string;
    verdipapir: string;
    kontanter: string;
    pengerSkyldt: string;
    depositumskonto: string;
}

const eqFormuegrunnlagVerdierFormData = struct<FormuegrunnlagVerdierFormData>({
    verdiIkkePrimærbolig: S.Eq,
    verdiEiendommer: S.Eq,
    verdiKjøretøy: S.Eq,
    innskudd: S.Eq,
    verdipapir: S.Eq,
    kontanter: S.Eq,
    pengerSkyldt: S.Eq,
    depositumskonto: S.Eq,
});

const eqFormuegrunnlagFormData = struct<FormuegrunnlagFormData>({
    epsFnr: eqNullable(S.Eq),
    periode: eqNullableDatePeriode,
    søkersFormue: eqFormuegrunnlagVerdierFormData,
    epsFormue: eqNullable(eqFormuegrunnlagVerdierFormData),
    måInnhenteMerInformasjon: B.Eq,
});

export const eqFormueVilkårFormData = struct<FormueVilkårFormData>({
    formue: getEq(eqFormuegrunnlagFormData),
});

export const verdierId: Array<keyof FormuegrunnlagVerdierFormData> = [
    'verdiIkkePrimærbolig',
    'verdiEiendommer',
    'verdiKjøretøy',
    'innskudd',
    'verdipapir',
    'pengerSkyldt',
    'kontanter',
    'depositumskonto',
];

export const formueVilkårTilFormData = (
    formueVilkår: FormueVilkår,
    bosituasjonsgrunnlag: Bosituasjon[],
): FormueVilkårFormData => ({
    formue: formueVilkår.vurderinger.map((formue) => {
        const epsFnr = bosituasjonPåDato(bosituasjonsgrunnlag, formue.periode.fraOgMed)?.fnr;
        return {
            epsFnr: epsFnr ?? null,
            periode: {
                fraOgMed: new Date(formue.periode.fraOgMed),
                tilOgMed: new Date(formue.periode.tilOgMed),
            },
            søkersFormue:
                formuegrunnlagVerdierTilVerdierFormDataEllerNy(formue.grunnlag.søkersFormue) ??
                lagTomFormuegrunnlagVerdier(),
            epsFormue: epsFnr ? formuegrunnlagVerdierTilVerdierFormDataEllerNy(formue.grunnlag.epsFormue) : null,
            måInnhenteMerInformasjon: formue.resultat === 'MåInnhenteMerInformasjon',
        };
    }),
});

export const nyFormuegrunnlagMedEllerUtenPeriode = (periode?: NullablePeriode): FormuegrunnlagFormData => ({
    epsFnr: null,
    periode: periode ?? lagTomPeriode(),
    søkersFormue: lagTomFormuegrunnlagVerdier(),
    epsFormue: null,
    måInnhenteMerInformasjon: false,
});

const formuegrunnlagVerdierTilVerdierFormDataEllerNy = (
    verdier: Nullable<FormuegrunnlagVerdier>,
): FormuegrunnlagVerdierFormData => {
    if (!verdier) {
        return lagTomFormuegrunnlagVerdier();
    }

    return {
        verdiIkkePrimærbolig: verdier.verdiIkkePrimærbolig.toString(),
        verdiEiendommer: verdier.verdiEiendommer.toString(),
        verdiKjøretøy: verdier.verdiKjøretøy.toString(),
        innskudd: verdier.innskudd.toString(),
        verdipapir: verdier.verdipapir.toString(),
        kontanter: verdier.kontanter.toString(),
        pengerSkyldt: verdier.pengerSkyldt.toString(),
        depositumskonto: verdier.depositumskonto.toString(),
    };
};

export const lagTomFormuegrunnlagVerdier = (): FormuegrunnlagVerdierFormData => ({
    verdiIkkePrimærbolig: '0',
    verdiEiendommer: '0',
    verdiKjøretøy: '0',
    innskudd: '0',
    verdipapir: '0',
    kontanter: '0',
    pengerSkyldt: '0',
    depositumskonto: '0',
});

export const erFormueVilkårOppfylt = (
    søkersBekreftetFormue: number,
    epsBekreftetFormue: number,
    fraOgMed: Nullable<Date>,
    formuegrenser: Formuegrenser[],
) => søkersBekreftetFormue + epsBekreftetFormue <= getSenesteHalvGVerdi(fraOgMed, formuegrenser);

export const formueVilkårFormTilRequest = (
    sakId: string,
    behandlingId: string,
    f: FormueVilkårFormData,
): FormueVilkårRequest => ({
    sakId: sakId,
    behandlingId: behandlingId,
    vurderinger: f.formue.map((grunnlag) => ({
        periode: periodeTilIsoDateString(grunnlag.periode!),
        søkersFormue: formuegrunnlagVerdierTilRequest(grunnlag.søkersFormue),
        epsFormue: grunnlag.epsFormue ? formuegrunnlagVerdierTilRequest(grunnlag.epsFormue) : null,
        måInnhenteMerInformasjon: grunnlag.måInnhenteMerInformasjon,
    })),
});

const formuegrunnlagVerdierTilRequest = (
    verdier: FormuegrunnlagVerdierFormData,
): FormuegrunnlagVerdierRequest => ({
    verdiIkkePrimærbolig: Number.parseInt(verdier.verdiIkkePrimærbolig, 0),
    verdiEiendommer: Number.parseInt(verdier.verdiEiendommer, 0),
    verdiKjøretøy: Number.parseInt(verdier.verdiKjøretøy, 0),
    innskudd: Number.parseInt(verdier.innskudd, 0),
    verdipapir: Number.parseInt(verdier.verdipapir, 0),
    kontanter: Number.parseInt(verdier.kontanter, 0),
    pengerSkyldt: Number.parseInt(verdier.pengerSkyldt, 0),
    depositumskonto: Number.parseInt(verdier.depositumskonto, 0),
});

//hvis fraOgMed ikke er utfyllt, eller vi ikke finner en match for fraOgMed,
//bruker vi den høyeste g-verdien som default
const getSenesteHalvGVerdi = (fraOgMed: Nullable<Date>, formuegrenser: Formuegrenser[]) => {
    const sortert = formuegrenser
        .slice()
        .sort((a: Formuegrenser, b: Formuegrenser) => Date.parse(b.gyldigFra) - Date.parse(a.gyldigFra));

    if (!fraOgMed) {
        return sortert[0].beløp;
    }

    const senesteGrense = sortert.find((grense) => {
        const parsed = DateFns.startOfDay(new Date(grense.gyldigFra));
        return DateFns.isAfter(fraOgMed, parsed) || DateFns.isEqual(fraOgMed, parsed);
    });

    return senesteGrense?.beløp ?? sortert[0].beløp;
};

const summerFormue = (formue: number[]) => {
    return formue.reduce((prev, current) => {
        if (isNaN(current)) {
            return prev + 0;
        }
        return prev + current;
    }, 0);
};

export const regnUtFormuegrunnlagVerdier = (
    verdier: Nullable<FormuegrunnlagVerdier | FormuegrunnlagVerdierFormData>,
) => {
    if (!verdier) {
        return 0;
    }

    //https://trello.com/c/cKPqPVXP/513-saksbehandling-formue-depositumskonto-trekkes-ikke-ifra-innskudd-p%C3%A5-konto
    //"depositum trekkes fra innskudd på konto(men det kan ikke bli minusbeløp), så summeres innskudd på konto med resten."
    const innskudd = Math.max(
        (verdier.innskudd ? Number(verdier.innskudd) : 0) -
            (verdier.depositumskonto ? Number(verdier.depositumskonto) : 0),
        0,
    );

    const skalAdderes = [
        verdier.verdiIkkePrimærbolig,
        verdier.verdiEiendommer,
        verdier.verdiKjøretøy,
        verdier.verdipapir,
        verdier.pengerSkyldt,
        verdier.kontanter,
    ];

    const skalAdderesParsed = skalAdderes.map((verdi) =>
        typeof verdi === 'string' ? Number.parseInt(verdi, 0) : verdi,
    );

    const formue = [...skalAdderesParsed, innskudd];

    return summerFormue(formue);
};

const getInitialVerdierFraGrunnlagEllerSøknad = (
    verdier: Nullable<FormuegrunnlagVerdier>,
    søknadsFormue: Nullable<SøknadInnhold['formue']>,
): FormuegrunnlagVerdierFormData => ({
    verdiIkkePrimærbolig: (verdier?.verdiIkkePrimærbolig ?? søknadsFormue?.verdiPåBolig ?? 0).toString(),
    verdiEiendommer: (verdier?.verdiEiendommer ?? søknadsFormue?.verdiPåEiendom ?? 0).toString(),
    verdiKjøretøy: verdier?.verdiKjøretøy?.toString() ?? (søknadsFormue?.kjøretøy?.length ? '' : 0).toString(),
    innskudd: (verdier?.innskudd ?? søknadsFormue?.innskuddsBeløp ?? 0).toString(),
    verdipapir: (verdier?.verdipapir ?? søknadsFormue?.verdipapirBeløp ?? 0).toString(),
    pengerSkyldt: (verdier?.pengerSkyldt ?? søknadsFormue?.skylderNoenMegPengerBeløp ?? 0).toString(),
    kontanter: (verdier?.kontanter ?? søknadsFormue?.kontanterBeløp ?? 0).toString(),
    depositumskonto: (verdier?.depositumskonto ?? søknadsFormue?.depositumsBeløp ?? 0).toString(),
});

export function getInitialFormueVilkårOgDelvisBosituasjon(
    søknadsInnhold: SøknadInnhold,
    grunnlagsdata: GrunnlagsdataOgVilkårsvurderinger,
    stønadsperiode: Periode,
): FormueVilkårFormData {
    const epsInformasjon = hentOmSøkerBorMedEpsOgEpsFnr(hentBosituasjongrunnlag(grunnlagsdata), søknadsInnhold);
    return {
        formue: [
            {
                epsFnr: epsInformasjon?.epsFnr,
                søkersFormue: getInitialVerdierFraGrunnlagEllerSøknad(
                    grunnlagsdata.formue?.vurderinger[0]?.grunnlag.søkersFormue ?? null,
                    søknadsInnhold.formue,
                ),
                epsFormue: epsInformasjon?.borSøkerMedEPS
                    ? getInitialVerdierFraGrunnlagEllerSøknad(
                          grunnlagsdata.formue?.vurderinger[0]?.grunnlag.epsFormue ?? null,
                          søknadsInnhold.ektefelle?.formue ?? null,
                      )
                    : null,
                periode: stønadsperiode,
                måInnhenteMerInformasjon: grunnlagsdata.formue?.resultat === FormueStatus.MåInnhenteMerInformasjon,
            },
        ],
    };
}

const verdierFormDataValidering = yup
    .object<FormuegrunnlagVerdierFormData>({
        verdiIkkePrimærbolig: validateStringAsNonNegativeNumber('Verdi på bolig'),
        verdiEiendommer: validateStringAsNonNegativeNumber('Verdi på eiendom'),
        verdiKjøretøy: validateStringAsNonNegativeNumber('Verdi på kjøretøy'),
        innskudd: validateStringAsNonNegativeNumber('Innskudd'),
        verdipapir: validateStringAsNonNegativeNumber('Verdipapir'),
        kontanter: validateStringAsNonNegativeNumber('Kontanter over 1000'),
        pengerSkyldt: validateStringAsNonNegativeNumber('Står noen i gjeld til deg'),
        depositumskonto: validateStringAsNonNegativeNumber('Depositumskonto').test(
            'depositumMindreEllerLikInnskudd',
            'Depositum kan ikke være større enn innskudd',
            function (depositum) {
                const { innskudd } = this.parent;
                if (!depositum) {
                    return false;
                }

                return parseInt(depositum, 10) <= parseInt(innskudd, 10);
            },
        ),
    })
    .required();

const formuegrunnlagSchema = yup
    .object<FormuegrunnlagFormData>({
        epsFnr: yup.string().nullable().defined(),
        periode: validerPeriodeTomEtterFom,
        søkersFormue: verdierFormDataValidering,
        epsFormue: yup
            .object<FormuegrunnlagVerdierFormData>()
            .defined()
            .when('epsFnr', {
                is: (value) => value?.length === 11,
                then: verdierFormDataValidering,
            }),
        måInnhenteMerInformasjon: yup.boolean(),
    })
    .required();

const formuegrunnlagArraySchema = yup.array().of(formuegrunnlagSchema).required().defined() as yup.ArraySchema<
    FormuegrunnlagFormData,
    object
>;

export const formueFormSchema = yup
    .object<FormueVilkårFormData>({
        formue: formuegrunnlagArraySchema,
    })
    .required() as yup.ObjectSchema<FormueVilkårFormData, object>;
