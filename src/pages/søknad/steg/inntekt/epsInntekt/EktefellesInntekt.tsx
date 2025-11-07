import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import søknadSlice from '~src/features/søknad/søknad.slice';
import { useI18n } from '~src/lib/i18n';
import { InntektForm } from '~src/pages/søknad/steg/inntekt/søkersInntekt/Inntekt';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import sharedI18n from '../../steg-shared-i18n';
import { FormData, inntektsValideringSchema } from '../validering';

import messages from './inntekt-nb';

const EktefellesInntekt = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const ektefelle = useAppSelector((s) => s.soknad.ektefelle);
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

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
            formatMessage={formatMessage}
        />
    );
};

export default EktefellesInntekt;
