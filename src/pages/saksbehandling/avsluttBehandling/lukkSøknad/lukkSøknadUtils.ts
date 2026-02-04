import yup from '~src/lib/validering';

export const fritekstSchema = yup.object({
    fritekst: yup.string().required().min(1).nullable(false).typeError('Du må legge inn fritekst til brevet'),
});

export const trukketSøknadSchema = yup.object({
    datoSøkerTrakkSøknad: yup.string().nullable(false).required().typeError('Du må velge dato'),
});
