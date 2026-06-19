import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements.tsx';
import { personligOppmøteUpdated } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';
import { useI18n } from '~src/lib/i18n.ts';
import messages from '~src/pages/kontrollsamtale/steg/personligOppmøte/personligOppmøte-nb.ts';
import { FormData, schema } from '~src/pages/kontrollsamtale/steg/personligOppmøte/validering.ts';
import Bunnknapper from '~src/pages/søknad/bunnknapper/Bunnknapper.tsx';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';

type Props = {
    nesteUrl: string;
    avbrytUrl: string;
};

const PersonligOppmøte = ({ nesteUrl, avbrytUrl }: Props) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages } });

    const personligOppmøte = useAppSelector((state) => state.kontrollsamtale.personligOppmøte);
    const form = useForm<FormData>({
        defaultValues: {
            personligOppmøte,
        },
        resolver: yupResolver(schema),
    });
    const onSubmit = (values: FormData) => {
        dispatch(personligOppmøteUpdated(values.personligOppmøte));
        navigate(nesteUrl);
    };
    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Heading level="1" size="large" spacing>
                Personlig oppmøte
            </Heading>

            <Controller
                control={form.control}
                name="personligOppmøte"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        {...field}
                        legend={formatMessage('input.harBrukerMøttPersonlig.label')}
                        error={fieldState.error?.message}
                        onChange={(value: boolean) => {
                            field.onChange(value);
                        }}
                    />
                )}
            />
            <Bunnknapper
                next={{}}
                avbryt={{
                    toRoute: avbrytUrl,
                }}
            />
        </form>
    );
};
export default PersonligOppmøte;
