import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader, TextField } from '@navikt/ds-react';
import { useEffect } from 'react';

import { fetchPerson } from '~src/api/personApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { Personkort } from '~src/components/personkort/Personkort';
import { pipe } from '~src/lib/fp';
import { ApiResult, useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { Person } from '~src/types/Person';
import styles from './FnrInput.module.less';
import messages from './FnrInput-nb';

interface FnrInputProps {
    label?: string;
    inputId: string;
    name?: string;
    fnr: Nullable<string>;
    onFnrChange: (fnr: string) => void;
    feil?: string;
    getHentetPerson?: (person: Nullable<Person>) => void;
    getPersonStatus?: (res: ApiResult<Person>) => void;
}
export const FnrInput = (props: FnrInputProps) => {
    const { formatMessage } = useI18n({ messages });

    const [personStatus, hentPerson] = useApiCall(fetchPerson);

    useEffect(() => {
        if (props.fnr?.length === 11) {
            hentPerson(props.fnr);
        }
    }, [props.fnr]);

    useEffect(() => {
        props.getPersonStatus?.(personStatus);
        pipe(
            personStatus,
            RemoteData.fold(
                () => props.getHentetPerson?.(null),
                () => props.getHentetPerson?.(null),
                () => props.getHentetPerson?.(null),
                (data) => props.getHentetPerson?.(data),
            ),
        );
    }, [personStatus._tag]);

    return (
        <div className={styles.fnrInput}>
            <TextField
                id={props.inputId}
                label={props.label ?? formatMessage('input.ektefelleEllerSamboerFnr.label')}
                name={props.name}
                description={formatMessage('input.ektefelleEllerSamboerFnrDescription.label')}
                onChange={(e) => props.onFnrChange(e.target.value)}
                value={props.fnr ?? ''}
                error={props.feil}
            />

            {pipe(
                personStatus,
                RemoteData.fold(
                    () => null,
                    () => <Loader />,
                    (err) => <ApiErrorAlert error={err} />,
                    (data) => <Personkort person={data} />,
                ),
            )}
        </div>
    );
};
