import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Textarea } from '@navikt/ds-react';
import React, { useState } from 'react';
import { FieldError } from 'react-hook-form';

import { ApiClientResult, ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';

import messages from './brevInput-nb';
import * as styles from './brevInput.module.less';

export interface BrevInputProps {
    tekst: Nullable<string>;
    onVisBrevClick: () => Promise<ApiClientResult<Blob>>;
    onChange: (e: React.ChangeEvent<unknown>) => void;
    tittel?: string;
    knappLabel?: string;
    placeholder?: string;
    feil?: FieldError;
    forhåndsvisningEnabled: boolean;
}

export function BrevInput(props: BrevInputProps) {
    const { formatMessage } = useI18n({ messages });
    const [hentBrevStatus, setHentBrevStatus] = useState<RemoteData.RemoteData<ApiError | undefined, null>>(
        RemoteData.initial
    );

    const onHentBrev = async () => {
        if (RemoteData.isPending(hentBrevStatus)) return;

        setHentBrevStatus(RemoteData.pending);
        const response = await props.onVisBrevClick();

        if (response.status === 'ok') {
            setHentBrevStatus(RemoteData.success(null));
            window.open(URL.createObjectURL(response.data));
        } else {
            setHentBrevStatus(RemoteData.failure(response.error));
        }
    };

    return (
        <div className={styles.brevContainer}>
            <div className={styles.textAreaContainer}>
                <Textarea
                    minRows={4}
                    label={props.tittel ?? formatMessage('input.tittel')}
                    name="tekstTilVedtaksbrev"
                    placeholder={props.placeholder}
                    value={props.tekst ?? ''}
                    onChange={props.onChange}
                    error={props.feil?.message}
                />
            </div>
            <div className={styles.seBrevContainer}>
                <Button
                    type="button"
                    variant="secondary"
                    className={styles.seBrevButton}
                    loading={RemoteData.isPending(hentBrevStatus)}
                    onClick={onHentBrev}
                    disabled={!props.forhåndsvisningEnabled}
                >
                    {props.knappLabel ?? formatMessage('knapp.seBrev')}
                </Button>
                {RemoteData.isFailure(hentBrevStatus) && <ApiErrorAlert error={hentBrevStatus.error} />}
            </div>
        </div>
    );
}
