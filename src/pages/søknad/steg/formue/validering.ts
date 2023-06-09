import { Kjøretøy, SøknadState } from '~src/features/søknad/søknad.slice';
import { keyOf, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export type FormData = SøknadState['formue'];

const kjøretøySchema = yup.object({
    verdiPåKjøretøy: yup
        .number()
        .typeError('Verdi på kjøretøy må være et tall')
        .positive()
        .label('Verdi på kjøretøy')
        .required('Fyll ut verdien av kjøretøyet') as yup.Schema<unknown> as yup.Schema<string>,
    kjøretøyDeEier: yup.string().required('Fyll ut registeringsnummeret'),
});

export const formueValideringSchema = (formueTilhører: 'søker' | 'eps') => {
    const tilhører = formueTilhører === 'søker' ? 'du' : 'ektefelle/samboer';

    return yup.object<FormData>({
        eierBolig: yup.boolean().nullable().required(`Fyll ut om ${tilhører} eier bolig`),
        borIBolig: yup
            .boolean()
            .nullable()
            .defined()
            .when('eierBolig', {
                is: true,
                then: yup.boolean().nullable().required(`Fyll ut om ${tilhører} bor i boligen`),
            }),
        verdiPåBolig: yup
            .number()
            .nullable()
            .defined()
            .when(keyOf<FormData>('borIBolig'), {
                is: false,
                then: yup
                    .number()
                    .typeError('Verdi på bolig må være et tall')
                    .label('Verdi på bolig')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        boligBrukesTil: yup
            .string()
            .nullable()
            .defined()
            .when(keyOf<FormData>('borIBolig'), {
                is: false,
                then: yup.string().nullable().min(1).required('Fyll ut hva boligen brukes til'),
            }),
        eierMerEnnEnBolig: yup
            .boolean()
            .nullable()
            .defined()
            .when(keyOf<FormData>('eierBolig'), {
                is: true,
                then: yup.boolean().nullable().required(`Fyll ut om ${tilhører} eier mer enn én bolig`),
            }),
        harDepositumskonto: yup
            .boolean()
            .nullable()
            .defined()
            .when(keyOf<FormData>('eierBolig'), {
                is: false,
                then: yup.boolean().nullable().required(`Fyll ut om ${tilhører} har depositumskonto`),
            }),
        depositumsBeløp: yup
            .number()
            .nullable()
            .defined()
            .when(keyOf<FormData>('harDepositumskonto'), {
                is: true,
                then: yup
                    .number()
                    .typeError('Depositumsbeløpet må være et tall')
                    .label('Depositumsbeløpet')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        verdiPåEiendom: yup
            .number()
            .nullable()
            .defined()
            .when(keyOf<FormData>('eierMerEnnEnBolig'), {
                is: true,
                then: yup
                    .number()
                    .typeError('Verdi på eiendom må være et tall')
                    .label('Verdi på eiendom')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        eiendomBrukesTil: yup
            .string()
            .nullable()
            .defined()
            .when(keyOf<FormData>('eierMerEnnEnBolig'), {
                is: true,
                then: yup.string().nullable().min(1).required('Fyll ut hva eiendommen brukes til'),
            }),
        eierKjøretøy: yup.boolean().nullable().required(`Fyll ut om ${tilhører} eier kjøretøy`),
        kjøretøy: yup
            .array<Kjøretøy>(kjøretøySchema.required())
            .defined()
            .when(keyOf<FormData>('eierKjøretøy'), {
                is: true,
                then: yup.array().min(1).required(),
                otherwise: yup.array().max(0),
            }),
        harInnskuddPåKonto: yup.boolean().nullable().required(`Fyll ut om ${tilhører} har penger på konto`),
        innskuddsBeløp: yup
            .number()
            .nullable()
            .label('Beløp på innskuddet')
            .defined()
            .when(keyOf<FormData>('harInnskuddPåKonto'), {
                is: true,
                then: yup
                    .number()
                    .typeError('Beløp på innskuddet må være et tall')
                    .nullable(false)
                    .positive()
                    .required(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        harVerdipapir: yup.boolean().nullable().required(`Fyll ut om ${tilhører} har verdipapirer`),
        verdipapirBeløp: yup
            .number()
            .nullable()
            .defined()
            .label('Beløp på verdipapirer')
            .when(keyOf<FormData>('harVerdipapir'), {
                is: true,
                then: yup.number().typeError('Beløp på verdipapirer må være et tall').nullable(false).positive(),
            }) as yup.Schema<Nullable<string>>,
        skylderNoenMegPenger: yup
            .boolean()
            .nullable()
            .required(`Fyll ut om noen skylder ${tilhører === 'du' ? 'deg' : tilhører} penger`),
        skylderNoenMegPengerBeløp: yup
            .number()
            .nullable()
            .label(`Hvor mye penger skylder de ${tilhører === 'du' ? 'deg' : tilhører} beløpet`)
            .defined()
            .when(keyOf<FormData>('skylderNoenMegPenger'), {
                is: true,
                then: yup
                    .number()
                    .typeError(`Hvor mye penger de skylder ${tilhører === 'du' ? 'deg' : tilhører} må være et tall`)
                    .nullable(false)
                    .positive(),
            }) as yup.Schema<Nullable<string>>,
        harKontanter: yup.boolean().nullable().required(`Fyll ut om ${tilhører} har kontanter over 1000`),
        kontanterBeløp: yup
            .number()
            .nullable()
            .defined()
            .when(keyOf<FormData>('harKontanter'), {
                is: true,
                then: yup
                    .number()
                    .typeError('Beløp på kontanter må være et tall')
                    .label('Beløp på kontanter')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
    });
};
