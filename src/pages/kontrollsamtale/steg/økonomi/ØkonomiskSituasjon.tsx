import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements.tsx';
import { økonomiskSituasjonUpdated } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';
import { useI18n } from '~src/lib/i18n.ts';
import { FormData, schema } from '~src/pages/kontrollsamtale/steg/økonomi/validering.ts';
import messages from '~src/pages/kontrollsamtale/steg/økonomi/økonomiskSituasjon-nb.ts';
import Bunnknapper from '~src/pages/søknad/bunnknapper/Bunnknapper.tsx';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';

type Props = {
    nesteUrl: string;
    forrigeUrl: string;
    avbrytUrl: string;
};

const ØkonomiskSituasjon = ({ nesteUrl, forrigeUrl, avbrytUrl }: Props) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages } });

    const økonomiskSituasjon = useAppSelector((state) => state.kontrollsamtale.økonomiskSituasjon);
    const form = useForm<FormData>({
        defaultValues: {
            økonomiskSituasjon,
        },
        resolver: yupResolver(schema),
    });
    const onSubmit = (values: FormData) => {
        dispatch(økonomiskSituasjonUpdated(values.økonomiskSituasjon));
        navigate(nesteUrl);
    };
    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Heading level="1" size="large" spacing>
                Økonomisk situasjon
            </Heading>

            <Controller
                control={form.control}
                name="økonomiskSituasjon"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        {...field}
                        legend={formatMessage(' økonomiskSituasjon.label')}
                        error={fieldState.error?.message}
                        onChange={(value: boolean) => {
                            field.onChange(value);
                        }}
                    />
                )}
            />
            <Bunnknapper
                previous={{
                    onClick: () => {
                        dispatch(økonomiskSituasjonUpdated(form.getValues().økonomiskSituasjon));
                        navigate(forrigeUrl);
                    },
                }}
                next={{}}
                avbryt={{
                    toRoute: avbrytUrl,
                }}
            />
        </form>
    );
};
export default ØkonomiskSituasjon;
