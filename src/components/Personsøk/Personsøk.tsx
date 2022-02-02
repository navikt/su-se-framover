import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader, SearchField } from '@navikt/ds-react';
import React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';

import { ApiError } from '~api/apiClient';
import { Person } from '~api/personApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import SkjemaelementFeilmelding from '~components/formElements/SkjemaelementFeilmelding';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import { removeSpaces } from '~utils/format/formatUtils';

import { Personkort } from '../personkort/Personkort';

import messages from './personsøk-nb';
import styles from './personsøk.module.less';

interface PersonsøkProps {
    person: RemoteData.RemoteData<ApiError, Person>;
    autofocusPersonsøk?: boolean;
    onFetchByFnr(fnr: string): void;
    onFetchBySaksnummer?(saksnummer: string): void;
    onReset(): void;
}

const Personsøk = (props: PersonsøkProps) => {
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const { intl } = useI18n({ messages });

    const [input, setInput] = React.useState('');
    const [inputErrorMessage, setInputErrorMsg] = React.useState<string | null>(null);

    React.useEffect(() => {
        setHasSubmitted(true);
        setInputErrorMsg(null);

        if (input.length !== 11) {
            props.onReset();
        }
    }, [input]);

    const handleSubmit = () => {
        if (!Number(input)) {
            return setInputErrorMsg(intl.formatMessage({ id: 'feilmelding.måVareTall' }));
        }

        if (!props.onFetchBySaksnummer || input.length === 11) {
            return props.onFetchByFnr(input);
        }

        props.onFetchBySaksnummer?.(input);
    };

    return (
        <RawIntlProvider value={intl}>
            <form
                onSubmit={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <div className={styles.inputContainer}>
                    <SearchField
                        label={
                            props.onFetchBySaksnummer
                                ? `${intl.formatMessage({ id: 'input.fnr.label' })} / ${intl.formatMessage({
                                      id: 'input.fnr.saksnummer',
                                  })}`
                                : intl.formatMessage({ id: 'input.fnr.label' })
                        }
                    >
                        <SearchField.Input
                            id="fnr"
                            name="input"
                            autoComplete="on"
                            onChange={(e) => {
                                setInput(removeSpaces(e.target.value));
                            }}
                            value={input}
                            // Så lenge denne er det eneste på siden sin så ønsker vi at den skal autofokuseres
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus={props.autofocusPersonsøk}
                        />
                        <SearchField.Button type="submit">
                            <FormattedMessage id="knapp.søk" />
                            {RemoteData.isPending(props.person) && <Loader />}
                        </SearchField.Button>
                    </SearchField>
                    {hasSubmitted && inputErrorMessage && (
                        <SkjemaelementFeilmelding>{inputErrorMessage}</SkjemaelementFeilmelding>
                    )}
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
            </form>
        </RawIntlProvider>
    );
};

export default Personsøk;
