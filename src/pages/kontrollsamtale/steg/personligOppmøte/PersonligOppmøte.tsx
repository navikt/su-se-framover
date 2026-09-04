import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements.tsx';
import {
    fullmaktOgLegeerklæringUpdated,
    personligOppmøteUpdated,
} from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as routes from '~src/lib/routes.ts';
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
    const { sakId, kontrollsamtaleId } = useRouteParams<typeof routes.kontrollsamtaleUtfylling>();

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
    if (!sakId || !kontrollsamtaleId) {
        throw new Error('Mangler sakId eller kontrollsamtaleId');
    }
    const onSubmit = (values: FormData) => {
        dispatch(personligOppmøteUpdated(values.personligOppmøte));

        if (values.personligOppmøte === true) {
            dispatch(fullmaktOgLegeerklæringUpdated(null));
            navigate(
                kontrollsamtaleUtfylling.createURL({
                    sakId,
                    step: KontrollsamtaleSteg.OriginalPass,
                    kontrollsamtaleId,
                }),
            );
            return;
        }
        navigate(
            kontrollsamtaleUtfylling.createURL({
                sakId,
                step: KontrollsamtaleSteg.FullmaktOgLegeerklæring,
                kontrollsamtaleId,
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
