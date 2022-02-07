import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader, TextField } from '@navikt/ds-react';
import React, { useEffect } from 'react';

import { fetchPerson, Person } from '~api/personApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { Personkort } from '~components/personkort/Personkort';
import { pipe } from '~lib/fp';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';

import messages from './FnrInput-nb';
import styles from './FnrInput.module.less';

interface FnrInputProps {
    label?: string;
    inputId: string;
    name?: string;
    fnr: Nullable<string>;
    onFnrChange: (fnr: string) => void;
    feil?: React.ReactNode;
    autoComplete?: string;
    getHentetPerson: (person: Nullable<Person>) => void;
}
export const FnrInput = ({
    label,
    inputId,
    name,
    fnr,
    onFnrChange,
    feil,
    autoComplete,
    getHentetPerson,
}: FnrInputProps) => {
    const { formatMessage } = useI18n({ messages });

    const [personStatus, hentPerson] = useApiCall(fetchPerson);

    useEffect(() => {
        if (fnr?.length === 11) {
            hentPerson(fnr);
        }
    }, [fnr]);

    useEffect(() => {
        pipe(
            personStatus,
            RemoteData.fold(
                () => getHentetPerson(null),
                () => getHentetPerson(null),
                () => getHentetPerson(null),
                (data) => getHentetPerson(data)
            )
        );
    }, [personStatus._tag]);

    return (
        <div className={styles.fnrInput}>
            <TextField
                id={inputId}
                label={label ?? formatMessage('input.ektefelleEllerSamboerFnr.label')}
                name={name}
                description={formatMessage('input.ektefelleEllerSamboerFnrDescription.label')}
                onChange={(e) => onFnrChange(e.target.value)}
                value={fnr ?? ''}
                maxLength={11}
                error={feil}
                autoComplete={autoComplete}
            />

            {pipe(
                personStatus,
                RemoteData.fold(
                    () => null,
                    () => <Loader />,
                    (err) => <ApiErrorAlert error={err} />,
                    (data) => <Personkort person={data} />
                )
            )}
        </div>
    );
};
