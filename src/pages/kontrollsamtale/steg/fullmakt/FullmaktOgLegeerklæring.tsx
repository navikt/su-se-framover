import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements.tsx';
import { fullmaktOgLegeerklæringUpdated } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';
import { useI18n } from '~src/lib/i18n.ts';
import messages from '~src/pages/kontrollsamtale/steg/fullmakt/fullmaktOgLegeerklæring-nb.ts';
import { FormData, schema } from '~src/pages/kontrollsamtale/steg/fullmakt/validering.ts';
import Bunnknapper from '~src/pages/søknad/bunnknapper/Bunnknapper.tsx';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';

type Props = {
    nesteUrl: string;
    forrigeUrl: string;
    avbrytUrl: string;
};

const FullmaktOgLegeerklæring = ({ nesteUrl, forrigeUrl, avbrytUrl }: Props) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages } });

    const fullmaktOgLegeerklæring = useAppSelector((state) => state.kontrollsamtale.fullmaktOgLegeerklæring);
    const form = useForm<FormData>({
        defaultValues: {
            fullmaktOgLegeerklæring,
        },
        resolver: yupResolver(schema),
    });
    const onSubmit = (values: FormData) => {
        dispatch(fullmaktOgLegeerklæringUpdated(values.fullmaktOgLegeerklæring));
        navigate(nesteUrl);
    };
    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
                control={form.control}
                name="fullmaktOgLegeerklæring"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        {...field}
                        legend={formatMessage('fullmaktOgLegeerklæring.label')}
                        description={formatMessage('fullmaktOgLegeerklæring.hjelpetekst')}
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
                        dispatch(fullmaktOgLegeerklæringUpdated(form.getValues().fullmaktOgLegeerklæring));
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

export default FullmaktOgLegeerklæring;
