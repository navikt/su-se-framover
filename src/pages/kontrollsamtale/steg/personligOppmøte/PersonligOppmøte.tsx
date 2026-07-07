import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements.tsx';
import {
    fullmaktOgLegeerklæringUpdated,
    personligOppmøteUpdated,
} from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';
import { useI18n } from '~src/lib/i18n.ts';
import { kontrollsamtaleUtfylling, useRouteParams } from '~src/lib/routes.ts';
import messages from '~src/pages/kontrollsamtale/steg/personligOppmøte/personligOppmøte-nb.ts';
import { FormData, schema } from '~src/pages/kontrollsamtale/steg/personligOppmøte/validering.ts';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';
import Bunnknapper from '~src/pages/søknad/bunnknapper/Bunnknapper.tsx';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';

type Props = {
    sakId: string;
    avbrytUrl: string;
};

const PersonligOppmøte = ({ avbrytUrl }: Props) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages } });
    const { sakId } = useRouteParams<typeof kontrollsamtaleUtfylling>();

    if (!sakId) {
        throw new Error('Mangler sakId');
    }

    const personligOppmøte = useAppSelector((state) => state.kontrollsamtale.personligOppmøte);
    const form = useForm<FormData>({
        defaultValues: {
            personligOppmøte,
        },
        resolver: yupResolver(schema),
    });
    const onSubmit = (values: FormData) => {
        dispatch(personligOppmøteUpdated(values.personligOppmøte));

        if (values.personligOppmøte === true) {
            dispatch(fullmaktOgLegeerklæringUpdated(null));
            navigate(
                kontrollsamtaleUtfylling.createURL({
                    sakId,
                    step: KontrollsamtaleSteg.OriginalPass,
                }),
            );
            return;
        }
        navigate(
            kontrollsamtaleUtfylling.createURL({
                sakId,
                step: KontrollsamtaleSteg.FullmaktOgLegeerklæring,
            }),
        );
    };
    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
