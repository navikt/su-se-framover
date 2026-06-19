import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements.tsx';
import { skatteOpplysningerUpdated } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';
import { useI18n } from '~src/lib/i18n.ts';
import messages from '~src/pages/kontrollsamtale/steg/skatteopplysninger/skatteOpplysninger-nb.ts';
import { FormData, schema } from '~src/pages/kontrollsamtale/steg/skatteopplysninger/validering.ts';
import Bunnknapper from '~src/pages/søknad/bunnknapper/Bunnknapper.tsx';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';

type Props = {
    nesteUrl: string;
    forrigeUrl: string;
    avbrytUrl: string;
};

const SkatteOpplysninger = ({ nesteUrl, forrigeUrl, avbrytUrl }: Props) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const skatteOpplysninger = useAppSelector((state) => state.kontrollsamtale.skatteOpplysninger);
    const { formatMessage } = useI18n({ messages: { ...messages } });

    const form = useForm<FormData>({
        defaultValues: {
            skatteOpplysninger,
        },
        resolver: yupResolver(schema),
    });
    const onSubmit = (values: FormData) => {
        dispatch(skatteOpplysningerUpdated(values.skatteOpplysninger));
        navigate(nesteUrl);
    };
    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Heading level="1" size="large" spacing>
                Skatteopplysninger
            </Heading>

            <Controller
                control={form.control}
                name="skatteOpplysninger"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        {...field}
                        legend={formatMessage('skatteopplysninger.label')}
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
                        dispatch(skatteOpplysningerUpdated(form.getValues().skatteOpplysninger));
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

export default SkatteOpplysninger;
