import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Button, Loader, Textarea } from '@navikt/ds-react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { ErrorIcon, SuccessIcon } from '~src/assets/Icons';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { ApiResult, useAutosaveOnUpdate } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';

import styles from './TextareaWithAutosave.module.less';

const messages = {
    'knapp.seBrev': 'Se brev',
};

const TextareaWithAutosave = <T extends object, U extends FieldValues>(props: {
    textarea: {
        name: Path<U>;
        label: React.ReactNode;
        control: Control<U>;
        value: string;
        description?: string[];
    };
    save: {
        handleSave: () => void;
        status: ApiResult<T>;
    };
    brev?: {
        handleSeBrev: () => void;
        status: ApiResult<Blob>;
    };
}) => {
    const { formatMessage } = useI18n({ messages });

    const { isSaving } = useAutosaveOnUpdate(props.textarea.value, () => {
        return props.save.handleSave();
    });

    return (
        <div className={styles.fritesktOgVisBrevContainer}>
            <Controller
                control={props.textarea.control}
                name={props.textarea.name}
                render={({ field, fieldState }) => (
                    <Textarea
                        className={styles.textarea}
                        {...field}
                        description={
                            props.textarea.description && (
                                <div className={styles.textareaLabel}>
                                    <div>
                                        {props.textarea.description.map((desc) => (
                                            <BodyShort key={desc}>{desc}</BodyShort>
                                        ))}
                                    </div>
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
                            )
                        }
                        minRows={5}
                        label={
                            <div className={styles.textareaLabel}>
                                {props.textarea.label}
                                {!props.textarea.description && (
                                    <div>
                                        {isSaving ? <Loader size="small" /> : null}
                                        {!isSaving && RemoteData.isSuccess(props.save.status) ? (
                                            <SuccessIcon width={20} />
                                        ) : null}
                                        {!isSaving && RemoteData.isFailure(props.save.status) ? (
                                            <ErrorIcon width={20} />
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        }
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    />
                )}
            />
            {props.brev && (
                <div className={styles.buttonOgApiErrorContainer}>
                    <Button
                        type="button"
                        className={styles.seBrevButton}
                        variant="secondary"
                        onClick={props.brev?.handleSeBrev}
                        loading={props.brev && (RemoteData.isPending(props.brev.status) || isSaving)}
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
