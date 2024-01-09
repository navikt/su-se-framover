import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Heading, TextField } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useI18n } from '~src/lib/i18n';

import messages from './SkattForm-nb';
import styles from './SkattForm.module.less';
import { SkattFormData, skattFormSchema } from './SkattFormUtils';

/**
 * Har kun ansvar for å søke opp skattegrunnlag for en gitt periode.
 */
const SkattForm = () => {
    const { formatMessage } = useI18n({ messages });

    const form = useForm<SkattFormData>({
        defaultValues: { fra: '', til: '' },
        resolver: yupResolver(skattFormSchema),
    });

    const onSubmit = (values: SkattFormData) => {
        console.log('submit', values);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Heading size="medium" spacing>
                {formatMessage('skatt.page.heading')}
            </Heading>

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
                        />
                    )}
                />

                <Button size="small" variant="secondary">
                    {formatMessage('skatt.button.søk')}
                </Button>
            </div>
        </form>
    );
};

export default SkattForm;
