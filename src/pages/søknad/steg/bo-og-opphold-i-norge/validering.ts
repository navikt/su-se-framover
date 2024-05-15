import * as DateFns from 'date-fns';

import { SøknadState } from '~src/features/søknad/søknad.slice';
import { DelerBoligMed, EPSFormData } from '~src/features/søknad/types';
import { keyOf } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Adresse, IngenAdresseGrunn } from '~src/types/Person';

export type FormData = SøknadState['boOgOpphold'];

const epsFormDataSchema = yup
    .object<EPSFormData>({
        fnr: yup.string().nullable().required().length(11).typeError('Ugyldig fødselsnummer'),
        erEpsFylt67: yup.boolean().nullable().required(),
        erUførFlyktning: yup
            .boolean()
            .when('erEpsFylt67', {
                is: false,
                then: yup.boolean().required('Fyll ut om ektefelle/samboer er ufør flyktning'),
                otherwise: yup.boolean().nullable().defined(),
            })
            .defined(),
    })
    .defined();

export const schema = yup.object<FormData>({
    borOgOppholderSegINorge: yup.boolean().nullable().required('Fyll ut om du bor og oppholder deg i Norge'),
    delerBoligMedPersonOver18: yup.boolean().nullable().required('Fyll ut om du deler bolig med noen over 18 år'),
    delerBoligMed: yup
        .mixed<DelerBoligMed>()
        .nullable()
        .when('delerBoligMedPersonOver18', {
            is: true,
            then: yup
                .mixed<DelerBoligMed>()
                .nullable()
                .oneOf<DelerBoligMed>(Object.values(DelerBoligMed), 'Du må velge hvem du deler bolig med')
                .required(),
        }),
    ektefellePartnerSamboer: yup
        .mixed<EPSFormData>()
        .when(keyOf<FormData>('delerBoligMed'), {
            is: DelerBoligMed.EKTEMAKE_SAMBOER,
            then: epsFormDataSchema,
            otherwise: yup.mixed().nullable().defined(),
        })
        .nullable()
        .defined(),
    innlagtPåInstitusjon: yup
        .boolean()
        .required('Fyll ut om du har vært innlagt på instituasjon siste 3 måneder')
        .nullable(),
    datoForInnleggelse: yup
        .string()
        .nullable()
        .defined()
        .when('innlagtPåInstitusjon', {
            is: true,
            then: yup
                .string()
                .required('Fyll ut datoen du var innlagt')
                .test({
                    name: 'datoFormattering',
                    message: 'Dato må være formatert på dd.mm.yyyy',
                    test: function (val) {
                        return DateFns.isValid(DateFns.parse(val, 'yyyy-MM-dd', new Date()));
                    },
                }),
        }),
    datoForUtskrivelse: yup
        .string()
        .nullable()
        .defined()
        .typeError('Dato må være på formatet dd.mm.yyyy')
        .test({
            name: 'datoForUtskivelse er fyllt ut',
            message: 'Fyll ut datoen for utskrivelse',
            test: function (val) {
                const innlagtPåinstitusjon = this.parent.innlagtPåinstitusjon;
                const fortsattInnlagt = this.parent.fortsattInnlagt;

                if (innlagtPåinstitusjon && !fortsattInnlagt && !val) {
                    return false;
                }
                return true;
            },
        })
        .test({
            name: 'datoForUtskivelse er etter innleggelse',
            message: 'Dato for utskrivelse må være etter innleggelse',
            test: function (val) {
                const innlagtPåinstitusjon = this.parent.innlagtPåInstitusjon;
                const datoForInnleggelse = this.parent.datoForInnleggelse;
                const fortsattInnlagt = this.parent.fortsattInnlagt;

                if (innlagtPåinstitusjon) {
                    if (fortsattInnlagt) {
                        return true;
                    } else if (!val) {
                        return false;
                    } else {
                        return DateFns.isAfter(
                            DateFns.parse(val, 'yyyy-MM-dd', new Date()),
                            new Date(datoForInnleggelse),
                        );
                    }
                }

                return true;
            },
        }),
    fortsattInnlagt: yup.boolean().nullable().defined(),
    borPåAdresse: yup
        .mixed<Adresse>()
        .nullable()
        .test({
            name: 'borPåAdresse',
            message: 'Du må velge hvor du bor',
            test: function () {
                return Boolean(this.parent.borPåAdresse || this.parent.ingenAdresseGrunn);
            },
        }),
    ingenAdresseGrunn: yup.mixed<IngenAdresseGrunn>().nullable(),
});
