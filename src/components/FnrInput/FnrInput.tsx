import * as RemoteData from '@devexperts/remote-data-ts';
import fnrValidator from '@navikt/fnrvalidator';
import AlertStripe from 'nav-frontend-alertstriper';
import { Input } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect, useState } from 'react';

import { ApiError } from '~api/apiClient';
import * as personApi from '~api/personApi';
import { Personkort } from '~components/Personkort';
import { useI18n } from '~lib/hooks';
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
    onAlderChange: (alder: Nullable<number>) => void;
}
export const FnrInput = ({
    label,
    inputId,
    name,
    fnr,
    onFnrChange,
    feil,
    autoComplete,
    onAlderChange,
}: FnrInputProps) => {
    const [person, setPerson] = useState<RemoteData.RemoteData<ApiError, personApi.Person>>(RemoteData.initial);
    const [harIkkeTilgang, setHarIkkeTilgang] = useState<boolean>(false);
    const intl = useI18n({ messages });

    async function fetchPerson(fødselsnummer: string) {
        setHarIkkeTilgang(false);
        setPerson(RemoteData.pending);
        const res = await personApi.fetchPerson(fødselsnummer);

        if (res.status === 'error') {
            if (res.error.statusCode === 403) {
                setHarIkkeTilgang(true);
            } else {
                setPerson(RemoteData.failure(res.error));
            }
        }

        if (res.status === 'ok') {
            setPerson(RemoteData.success(res.data));
            onAlderChange(res.data.alder);
        }
    }

    useEffect(() => {
        setPerson(RemoteData.initial);
        if (fnr?.length === 11) {
            const validateFnr = fnrValidator.fnr(fnr);
            if (validateFnr.status === 'valid') {
                fetchPerson(fnr);
            }
        }
    }, [fnr]);

    return (
        <div className={styles.fnrInput}>
            <Input
                id={inputId}
                label={label ?? intl.formatMessage({ id: 'input.ektefelleEllerSamboerFnr.label' })}
                name={name}
                description={intl.formatMessage({ id: 'input.ektefelleEllerSamboerFnrDescription.label' })}
                onChange={(e) => onFnrChange(e.target.value)}
                value={fnr ?? ''}
                maxLength={11}
                feil={feil}
                autoComplete={autoComplete}
            />

            {RemoteData.isPending(person) && <NavFrontendSpinner />}
            {RemoteData.isSuccess(person) && (
                <div>
                    <Personkort person={person.value} />
                </div>
            )}
            {RemoteData.isFailure(person) && (
                <div>
                    <AlertStripe type="feil">
                        {intl.formatMessage({ id: 'ektefelleEllerSamboer.feil.kunneIkkeSøkePerson' })}
                    </AlertStripe>
                </div>
            )}
            {harIkkeTilgang && (
                <div>
                    <AlertStripe type="feil">
                        {intl.formatMessage({ id: 'ektefelleEllerSamboer.feil.ikkeTilgang' })}
                    </AlertStripe>
                </div>
            )}
        </div>
    );
};
