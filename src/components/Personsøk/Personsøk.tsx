import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader, Search } from '@navikt/ds-react';
import React from 'react';

import { Person } from '~api/personApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import SkjemaelementFeilmelding from '~components/formElements/SkjemaelementFeilmelding';
import { pipe } from '~lib/fp';
import { ApiResult } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { removeSpaces } from '~utils/format/formatUtils';

import { Personkort } from '../personkort/Personkort';

import messages from './personsøk-nb';
import styles from './personsøk.module.less';

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

    return (
        <div className={styles.personsøk}>
            <div className={styles.inputContainer}>
                <Search
                    label={
                        props.onFetchBySaksnummer
                            ? `${formatMessage('input.fnr.label')} / ${formatMessage('input.fnr.saksnummer')}`
                            : formatMessage('input.fnr.label')
                    }
                    onSearch={(e) => handleSubmit(e as string)}
                    onClear={props.onReset}
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
