import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Textarea } from '@navikt/ds-react';
import { ChangeEvent, useState } from 'react';
import { FieldError } from 'react-hook-form';

import { ApiClientResult, ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import styles from './brevInput.module.less';
import messages from './brevInput-nb';

export interface BrevInputProps {
    tekst: Nullable<string>;
    onVisBrevClick: () => Promise<ApiClientResult<Blob> | undefined>;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    tittel?: string;
    knappLabel?: string;
    placeholder?: string;
    feil?: FieldError;
}

export function BrevInput(props: BrevInputProps) {
    const { formatMessage } = useI18n({ messages });
    const [hentBrevStatus, setHentBrevStatus] = useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);

    const onHentBrev = async () => {
        if (RemoteData.isPending(hentBrevStatus)) return;

        setHentBrevStatus(RemoteData.pending);
        const response = await props.onVisBrevClick();

        //siden det er nå mulig å chaine api kall før se-brev, så sjekker vi at det første kallet i parenten gikk ok
        //stort sett så vil vi ikke vise brevutkast hvis vi ikke fikk lagret brevet etc.
        if (!response) {
            setHentBrevStatus(RemoteData.initial);
            return;
        }

        if (response?.status === 'ok') {
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
                >
                    {props.knappLabel ?? formatMessage('knapp.seBrev')}
                </Button>
                {RemoteData.isFailure(hentBrevStatus) && <ApiErrorAlert error={hentBrevStatus.error} />}
            </div>
        </div>
    );
}
