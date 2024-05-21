import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import søknadSlice from '~src/features/søknad/søknad.slice';
import { InntektForm } from '~src/pages/søknad/steg/inntekt/søkersInntekt/Inntekt';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import { inntektsValideringSchema, FormData } from '../validering';

const EktefellesInntekt = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const ektefelle = useAppSelector((s) => s.soknad.ektefelle);
    const dispatch = useAppDispatch();

    const form = useForm<FormData>({
        defaultValues: ektefelle.inntekt,
        resolver: yupResolver(inntektsValideringSchema('eps')),
    });

    const save = (values: FormData) =>
        dispatch(søknadSlice.actions.ektefelleUpdated({ ...ektefelle, inntekt: values }));

    return (
        <InntektForm
            form={form}
            save={save}
            nesteUrl={props.nesteUrl}
            avbrytUrl={props.avbrytUrl}
            forrigeUrl={props.forrigeUrl}
        />
    );
};

export default EktefellesInntekt;
