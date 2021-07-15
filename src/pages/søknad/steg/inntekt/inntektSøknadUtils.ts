import { SøknadState } from '~features/søknad/søknad.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';

type InntektFormData = SøknadState['inntekt'];

const trygdeytelserIUtlandetSchema = yup.object({
    beløp: yup
        .number()
        .typeError('Den lokale valutaen må være et tall')
        .positive()
        .required('Fyll ut hvor mye du får i lokal valuta') as yup.Schema<unknown> as yup.Schema<string>,
    type: yup.string().required('Fyll ut hvilken type ytelsen er'),
    valuta: yup.string().required('Fyll ut valutaen for ytelsen'),
});

export const inntektsValideringSchema = (formueTilhører: 'søker' | 'eps') => {
    const tilhører = formueTilhører === 'søker' ? 'du' : 'ektefelle/samboer';

    return yup.object<InntektFormData>({
        harForventetInntekt: yup.boolean().nullable().required(`Fyll ut om ${tilhører} forventer arbeidsinntekt`),
        forventetInntekt: yup
            .number()
            .nullable()
            .defined()
            .when('harForventetInntekt', {
                is: true,
                then: yup
                    .number()
                    .typeError('Forventet inntekt må være et tall')
                    .label('Forventet inntekt')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        harMottattSosialstønad: yup
            .boolean()
            .nullable()
            .required(`Fyll ut om ${tilhører} har mottatt sosialstønad siste 3 måneder`),
        sosialStønadBeløp: yup
            .number()
            .nullable()
            .when('harMottattSosialstønad', {
                is: true,
                then: yup
                    .number()
                    .typeError('Beløp på sosialstønad må være et tall')
                    .label('Beløp på sosialstønad')
                    .nullable()
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        mottarPensjon: yup.boolean().nullable().required(`Fyll ut om ${tilhører} mottar pensjon`),
        pensjonsInntekt: yup
            .array(
                yup
                    .object({
                        ordning: yup.string().required(`Fyll ut hvem ${tilhører} mottar pensjon fra`),
                        beløp: yup
                            .number()
                            .defined()
                            .label('Pensjonsinntekt')
                            .typeError('Pensjonsinntekt må et være tall')
                            .positive()
                            .required() as unknown as yup.Schema<string>,
                    })
                    .required()
            )
            .defined()
            .when('mottarPensjon', {
                is: true,
                then: yup.array().min(1).required(),
                otherwise: yup.array().max(0),
            }),
        andreYtelserINav: yup.boolean().nullable().required(`Fyll ut om ${tilhører} har andre ytelser i NAV`),
        andreYtelserINavYtelse: yup
            .string()
            .nullable()
            .defined()
            .when('andreYtelserINav', {
                is: true,
                then: yup.string().nullable().min(1).required('Fyll ut hvilken ytelse det er'),
            }),
        andreYtelserINavBeløp: yup
            .number()
            .nullable()
            .defined()
            .when('andreYtelserINav', {
                is: true,
                then: yup
                    .number()
                    .typeError('Beløp på andre ytelser må være et tall')
                    .label('Beløp på andre ytelser')
                    .nullable(false)
                    .positive(),
                otherwise: yup.number(),
            }) as yup.Schema<Nullable<string>>,
        søktAndreYtelserIkkeBehandlet: yup
            .boolean()
            .nullable()
            .required(
                `Fyll ut om ${tilhører} har søkt på andre trygdeytelser som ${
                    tilhører === 'du' ? 'du' : 'hen'
                } ikke har fått svar på`
            ),
        søktAndreYtelserIkkeBehandletBegrunnelse: yup
            .string()
            .nullable()
            .defined()
            .when('søktAndreYtelserIkkeBehandlet', {
                is: true,
                then: yup
                    .string()
                    .nullable()
                    .min(1)
                    .required(`Fyll ut hvilke andre ytelser ${tilhører} ikke har fått svar på`),
            }),
        harTrygdeytelserIUtlandet: yup
            .boolean()
            .nullable()
            .required(`Fyll ut om ${tilhører} har trygdeytelser i utlandet`),
        trygdeytelserIUtlandet: yup
            .array(trygdeytelserIUtlandetSchema.required())
            .defined()
            .when('harTrygdeytelserIUtlandet', {
                is: true,
                then: yup.array().min(1).required(),
                otherwise: yup.array().max(0),
            }),
    });
};
