import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements.tsx';
import { gyldigPassUpdated, originalPassUpdated } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';
import { useI18n } from '~src/lib/i18n.ts';
import messages from '~src/pages/kontrollsamtale/steg/pass/originalPass-nb.ts';
import { FormData, schema } from '~src/pages/kontrollsamtale/steg/pass/validering.ts';
import Bunnknapper from '~src/pages/søknad/bunnknapper/Bunnknapper.tsx';
import styles from '~src/pages/søknad/steg/utenlandsopphold/utenlandsopphold.module.less';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';

type Props = {
    nesteUrl: string;
    forrigeUrl: string;
    avbrytUrl: string;
};

const OriginalPass = ({ nesteUrl, forrigeUrl, avbrytUrl }: Props) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages } });

    const originalPass = useAppSelector((state) => state.kontrollsamtale.originalPass);
    const gyldigPass = useAppSelector((state) => state.kontrollsamtale.gyldigPass);

    const form = useForm<FormData>({
        defaultValues: {
            originalPass,
            gyldigPass,
        },
        resolver: yupResolver(schema),
    });
    const onSubmit = (values: FormData) => {
        dispatch(originalPassUpdated(values.originalPass));
        dispatch(gyldigPassUpdated(values.gyldigPass));

        navigate(nesteUrl);
    };
    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className={styles.reiseItemContainer}>
                <Controller
                    control={form.control}
                    name="originalPass"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('originalPass.label')}
                            description={formatMessage('originalPass.hjelpetekst')}
                            error={fieldState.error?.message}
                            onChange={(value: boolean) => {
                                field.onChange(value);
                            }}
                        />
                    )}
                />
                <Controller
                    control={form.control}
                    name="gyldigPass"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('gyldigPass.label')}
                            description={formatMessage('gyldigPass,hjelpetekst')}
                            error={fieldState.error?.message}
                            labels={{
                                true: formatMessage('gyldigPass.radio.label.ja'),
                                false: formatMessage('gyldigPass.radio.label.nei'),
                            }}
                            onChange={(value: boolean) => {
                                field.onChange(value);
                            }}
                        />
                    )}
                />
                <Bunnknapper
                    previous={{
                        onClick: () => {
                            dispatch(originalPassUpdated(form.getValues().originalPass));
                            navigate(forrigeUrl);
                        },
                    }}
                    next={{}}
                    avbryt={{
                        toRoute: avbrytUrl,
                    }}
                />
            </div>
        </form>
    );
};

export default OriginalPass;
