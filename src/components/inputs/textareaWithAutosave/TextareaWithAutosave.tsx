import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Loader, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { ApiError } from '~src/api/apiClient';
import { ErrorIcon, SuccessIcon } from '~src/assets/Icons';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { ApiResult, useAutosaveOnChange } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';

import styles from './TextareaWithAutosave.module.less';

const messages = {
    'knapp.seBrev': 'Se brev',
};

const TextareaWithAutosave = <T extends object, U extends FieldValues>(props: {
    textarea: {
        name: string;
        label: string;
        control: Control<U>;
        value: string;
    };
    save: {
        handleSave: () => void;
        status: ApiResult<T>;
    };
    brev?: {
        handleSeBrev: () => void;
        status: RemoteData.RemoteData<ApiError, null>;
    };
}) => {
    const { formatMessage } = useI18n({ messages });

    const { isSaving } = useAutosaveOnChange(props.textarea.value, () => {
        props.save.handleSave();
    });

    return (
        <div className={styles.fritesktOgVisBrevContainer}>
            <Controller
                control={props.textarea.control}
                name={props.textarea.name as Path<U>}
                render={({ field, fieldState }) => (
                    <Textarea
                        {...field}
                        minRows={5}
                        label={
                            <div className={styles.textareaLabel}>
                                {props.textarea.label}
                                <div>
                                    {isSaving ? <Loader size="small" /> : null}
                                    {!isSaving && RemoteData.isSuccess(props.save.status) ? (
                                        <SuccessIcon width={20} />
                                    ) : null}
                                    {!isSaving && RemoteData.isFailure(props.save.status) ? (
                                        <ErrorIcon width={20} />
                                    ) : null}
                                </div>
                            </div>
                        }
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    />
                )}
            />
            {props.brev && (
                <div>
                    <Button
                        type="button"
                        className={styles.seBrevButton}
                        variant="secondary"
                        onClick={props.brev?.handleSeBrev}
                        loading={props.brev && RemoteData.isPending(props.brev.status)}
                    >
                        {formatMessage('knapp.seBrev')}
                    </Button>
                    {RemoteData.isFailure(props.brev.status) && <ApiErrorAlert error={props.brev.status.error} />}
                </div>
            )}
        </div>
    );
};

export default TextareaWithAutosave;
