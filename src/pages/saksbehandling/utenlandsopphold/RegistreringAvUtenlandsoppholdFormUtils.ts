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
    };
};

export const registrerUtenlandsoppholdFormDataTilRegistrerRequest = (arg: {
    sakId: string;
    data: RegisteringAvUtenlandsoppholdFormData;
}): RegistrerUtenlandsoppholdRequest => ({
    sakId: arg.sakId,
    periode: {
        fraOgMed: toIsoDateOnlyString(arg.data.periode.fraOgMed!),
        tilOgMed: toIsoDateOnlyString(arg.data.periode.tilOgMed!),
    },
    dokumentasjon: arg.data.dokumentasjon!,
    journalposter: arg.data.journalposter.map((it) => it.journalpostId!),
});

export const registrerUtenlandsoppholdFormDataTilOppdaterRequest = (arg: {
    sakId: string;
    registrertUtenlandsoppholdId: string;
    data: RegisteringAvUtenlandsoppholdFormData;
}): OppdaterRegistrertUtenlandsoppholdRequest => ({
    ...registrerUtenlandsoppholdFormDataTilRegistrerRequest({
        sakId: arg.sakId,
        data: arg.data,
    }),
    utenlandsoppholdId: arg.registrertUtenlandsoppholdId,
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
});
