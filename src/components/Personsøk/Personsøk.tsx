import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader, Search } from '@navikt/ds-react';
import React, { useEffect } from 'react';

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

interface PersonsøkProps {
    person: ApiResult<Person>;
    onFetchByFnr: (fnr: string) => void;
    onFetchBySaksnummer?: (saksnummer: string) => void;
    onReset: () => void;
}

const Personsøk = (props: PersonsøkProps) => {
    const { formatMessage } = useI18n({ messages });

    const [inputErrorMessage, setInputErrorMsg] = React.useState<string | null>(null);

    const handleSubmit = (search: string) => {
        setInputErrorMsg(null);
        const strippedSearch = removeSpaces(search);
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
            <div>
                <Search
                    label={
                        props.onFetchBySaksnummer
                            ? `${formatMessage('input.fnr.label')} / ${formatMessage('input.fnr.saksnummer')}`
                            : formatMessage('input.fnr.label')
                    }
                    onSearch={(e) => handleSubmit(e as string)}
                    onClear={props.onReset}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            handleSubmit(event.currentTarget.value);
                        }
                    }}
                    type="primary"
                >
                    <Search.Button>
                        {RemoteData.isPending(props.person) ? <Loader /> : formatMessage('knapp.søk')}
                    </Search.Button>
                </Search>
                {inputErrorMessage && <SkjemaelementFeilmelding>{inputErrorMessage}</SkjemaelementFeilmelding>}
            </div>
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
