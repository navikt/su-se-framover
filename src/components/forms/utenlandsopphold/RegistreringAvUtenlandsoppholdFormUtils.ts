import { Nullable } from '~src/lib/types';
import yup, { validerPeriodeTomEtterFomUtenSisteDagBegrensning } from '~src/lib/validering';
import { NullablePeriode } from '~src/types/Periode';
import {
    OppdaterRegistrertUtenlandsoppholdRequest,
    RegistrertUtenlandsopphold,
    RegistrerUtenlandsoppholdRequest,
    UtenlandsoppholdDokumentasjon,
} from '~src/types/RegistrertUtenlandsopphold';
import { toDateOrNull, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

export interface RegisteringAvUtenlandsoppholdFormData {
    periode: NullablePeriode<Date>;
    dokumentasjon: Nullable<UtenlandsoppholdDokumentasjon>;
    journalposter: Array<{ journalpostId: Nullable<string> }>;
    begrunnelse: Nullable<string>;
}

export const registrertUtenlandsoppholdTilFormDataEllerDefault = (
    registrertUtenlandsopphold?: RegistrertUtenlandsopphold
): RegisteringAvUtenlandsoppholdFormData => {
    return {
        periode: {
            fraOgMed: toDateOrNull(registrertUtenlandsopphold?.periode.fraOgMed),
            tilOgMed: toDateOrNull(registrertUtenlandsopphold?.periode.tilOgMed),
        },
        dokumentasjon: registrertUtenlandsopphold?.dokumentasjon ?? null,
        journalposter: registrertUtenlandsopphold?.journalposter
            ? registrertUtenlandsopphold?.journalposter.map((it) => ({
                  journalpostId: it,
              }))
            : [],
        begrunnelse: registrertUtenlandsopphold?.begrunnelse || null,
    };
};

export const registrerUtenlandsoppholdFormDataTilRegistrerRequest = (arg: {
    sakId: string;
    saksversjon: number;
    data: RegisteringAvUtenlandsoppholdFormData;
}): RegistrerUtenlandsoppholdRequest => ({
    sakId: arg.sakId,
    periode: {
        fraOgMed: toIsoDateOnlyString(arg.data.periode.fraOgMed!),
        tilOgMed: toIsoDateOnlyString(arg.data.periode.tilOgMed!),
    },
    dokumentasjon: arg.data.dokumentasjon!,
    journalposter: arg.data.journalposter.map((it) => it.journalpostId!),
    saksversjon: arg.saksversjon,
    begrunnelse: arg.data.begrunnelse,
});

export const registrerUtenlandsoppholdFormDataTilOppdaterRequest = (arg: {
    sakId: string;
    saksversjon: number;
    oppdatererVersjon: number;
    data: RegisteringAvUtenlandsoppholdFormData;
}): OppdaterRegistrertUtenlandsoppholdRequest => ({
    ...registrerUtenlandsoppholdFormDataTilRegistrerRequest({
        sakId: arg.sakId,
        saksversjon: arg.saksversjon,
        data: arg.data,
    }),
    oppdatererVersjon: arg.oppdatererVersjon,
});

export const registeringAvUtenlandsoppholdFormSchema = yup.object<RegisteringAvUtenlandsoppholdFormData>({
    periode: validerPeriodeTomEtterFomUtenSisteDagBegrensning,
    dokumentasjon: yup
        .string()
        .oneOf([...Object.values(UtenlandsoppholdDokumentasjon)])
        .nullable()
        .required(),
    journalposter: yup
        .array<{ journalpostId: Nullable<string> }>(
            yup
                .object({
                    journalpostId: yup.string().required().typeError('Feltet må fylles ut'),
                })
                .required()
        )
        .notRequired()
        .defined(),
    begrunnelse: yup.string().nullable().defined(),
});
