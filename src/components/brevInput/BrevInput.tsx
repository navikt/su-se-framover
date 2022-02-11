import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Textarea } from '@navikt/ds-react';
import React, { useState } from 'react';
import { FieldError } from 'react-hook-form';
import { IntlShape } from 'react-intl';

import { ApiClientResult, ApiError } from '~api/apiClient';

import styles from './brevInput.module.less';

export interface BrevInputProps {
    tekst: string;
    onVisBrevClick: () => Promise<ApiClientResult<Blob>>;
    onChange: (e: React.ChangeEvent<unknown>) => void;
    intl: IntlShape;
    tittel: string;
    placeholder?: string;
    feil?: FieldError;
}

export function BrevInput(props: BrevInputProps) {
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
                    label={props.tittel}
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
                >
                    {props.intl.formatMessage({ id: 'knapp.seBrev' })}
                </Button>
                {RemoteData.isFailure(hentBrevStatus) && (
                    <Alert variant="error">
                        {hentBrevStatus?.error?.body?.message || props.intl.formatMessage({ id: 'feil.ukjentFeil' })}
                    </Alert>
                )}
            </div>
        </div>
    );
}
