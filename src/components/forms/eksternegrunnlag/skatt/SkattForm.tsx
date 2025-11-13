import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Heading, TextField } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import styles from './SkattForm.module.less';
import messages from './SkattForm-nb';
import { SkattFormData, skattFormSchema } from './SkattFormUtils';

/**
 * Har kun ansvar for å søke opp skattegrunnlag for en gitt periode.
 */
const SkattForm = <T extends ApiResult<unknown>>(props: {
    onSøk: {
        fn: (values: SkattFormData) => void;
        onSøkStatus: T;
    };
    medTittel?: boolean;
    defaultValues?: { fra?: string; til?: string };
}) => {
    const { formatMessage } = useI18n({ messages });

    const form = useForm<SkattFormData>({
        defaultValues: { fra: props.defaultValues?.fra, til: props.defaultValues?.til },
        resolver: yupResolver(skattFormSchema),
    });

    const onSubmit = (values: SkattFormData) => {
        props.onSøk.fn(values);
    };

    return (
        <form className={styles.formContainer} onSubmit={form.handleSubmit(onSubmit)}>
            {props.medTittel && (
                <Heading size="medium" spacing>
                    {formatMessage('skatt.page.heading')}
                </Heading>
            )}

            <div className={styles.yearRangeInputsContainer}>
                <Controller
                    name={'fra'}
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={formatMessage('skatt.input.textfield.fra')}
                            inputMode="numeric"
                            {...field}
                            error={fieldState.error?.message}
                            autoComplete="off"
                            onChange={(e) => {
                                field.onChange(e);
                                if (e.target.value.length === 4) {
                                    form.setValue('til', e.target.value);
                                }
                            }}
                        />
                    )}
                />

                <Controller
                    name={'til'}
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <TextField
                            label={formatMessage('skatt.input.textfield.til')}
                            inputMode="numeric"
                            {...field}
                            error={fieldState.error?.message}
                            autoComplete="off"
                        />
                    )}
                />

                <Button size="small" variant="secondary" loading={RemoteData.isPending(props.onSøk.onSøkStatus)}>
                    {formatMessage('skatt.button.søk')}
                </Button>
            </div>
            {RemoteData.isFailure(props.onSøk.onSøkStatus) && <ApiErrorAlert error={props.onSøk.onSøkStatus.error} />}
        </form>
    );
};

export default SkattForm;
