import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader, Search } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Person } from '~src/api/personApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import { pipe } from '~src/lib/fp';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { removeSpaces } from '~src/utils/format/formatUtils';

import { Personkort } from '../personkort/Personkort';

import messages from './personsøk-nb';
import * as styles from './personsøk.module.less';

interface Props {
    person: ApiResult<Person>;
    onFetchByFnr: (fnr: string) => void;
    onFetchBySaksnummer?: (saksnummer: string) => void;
    onReset: () => void;
}
interface Form {
    fnr: string;
}

const Personsøk = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    const [inputErrorMessage, setInputErrorMsg] = React.useState<string | null>(null);
    const { control, handleSubmit } = useForm<Form>({
        defaultValues: {
            fnr: '',
        },
    });

    const submitHandler = (formData: Form) => {
        setInputErrorMsg(null);
        const strippedSearch = removeSpaces(formData.fnr);
        if (!Number(strippedSearch)) {
            return setInputErrorMsg(formatMessage('feilmelding.måVareTall'));
        }

        !props.onFetchBySaksnummer || strippedSearch.length === 11
            ? props.onFetchByFnr(strippedSearch)
            : props.onFetchBySaksnummer?.(strippedSearch);
    };

    useEffect(() => {
        props.onReset();
    }, []);

    return (
        <div className={styles.personsøk}>
            <form onSubmit={handleSubmit(submitHandler)}>
                <Controller
                    control={control}
                    name="fnr"
                    render={({ field }) => (
                        <Search
                            value={field.value}
                            onChange={field.onChange}
                            label={
                                props.onFetchBySaksnummer
                                    ? `${formatMessage('input.fnr.label')} / ${formatMessage('input.fnr.saksnummer')}`
                                    : formatMessage('input.fnr.label')
                            }
                            onClear={props.onReset}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleSubmit(submitHandler);
                                }
                            }}
                            type="primary"
                        >
                            <Search.Button>
                                {RemoteData.isPending(props.person) ? <Loader /> : formatMessage('knapp.søk')}
                            </Search.Button>
                        </Search>
                    )}
                />
                {inputErrorMessage && <SkjemaelementFeilmelding>{inputErrorMessage}</SkjemaelementFeilmelding>}
            </form>
            <div className={styles.personkortWrapper}>
                {pipe(
                    props.person,
                    RemoteData.fold(
                        () => null,
                        () => null,
                        (err) => <ApiErrorAlert error={err} />,
                        (s) => <Personkort person={s} />
                    )
                )}
            </div>
        </div>
    );
};

export default Personsøk;
