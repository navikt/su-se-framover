import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Loader, Textarea } from '@navikt/ds-react';
import { FieldValues, Path } from 'react-hook-form';
import { ErrorIcon, SuccessIcon } from '~src/assets/Icons';
import { ApiResult, useAutosaveOnUpdate } from '~src/lib/hooks';
import { fjernOverflødigLinjeskift } from '~src/utils/fritekst/fritekstUtil.ts';
import styles from './TextareaWithAutosave.module.less';

const TextareaWithAutosaveUtenController = <U extends FieldValues>(props: {
    textarea: {
        name: Path<U>;
        label: string;
        value: string;
        description?: string[];
        onChange: (value: string) => void;
        readonly: boolean;
        minRows: number;
    };
    save: {
        handleSave: () => void;
        status: ApiResult<void>;
    };
}) => {
    const { isSaving } = useAutosaveOnUpdate(props.textarea.value, () => {
        return props.save.handleSave();
    });

    return (
        <div className={styles.fritesktOgVisBrevContainer}>
            <Textarea
                className={styles.textarea}
                readOnly={props.textarea.readonly}
                onPaste={(e) => {
                    e.preventDefault();
                    props.textarea.onChange(fjernOverflødigLinjeskift(e, props.textarea.value));
                }}
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
                                {!isSaving && RemoteData.isFailure(props.save.status) ? <ErrorIcon width={20} /> : null}
                            </div>
                        </div>
                    )
                }
                minRows={props.textarea.minRows}
                label={
                    <div className={styles.textareaLabel}>
                        {props.textarea.label}
                        {!props.textarea.description && (
                            <div>
                                {isSaving ? <Loader size="small" /> : null}
                                {!isSaving && RemoteData.isSuccess(props.save.status) ? (
                                    <SuccessIcon width={20} />
                                ) : null}
                                {!isSaving && RemoteData.isFailure(props.save.status) ? <ErrorIcon width={20} /> : null}
                            </div>
                        )}
                    </div>
                }
                onChange={(e) => props.textarea.onChange(e.target.value)}
                value={props.textarea.value ?? ''}
            />
        </div>
    );
};

export default TextareaWithAutosaveUtenController;
