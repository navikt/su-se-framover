import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader, SearchField, SearchFieldInput } from '@navikt/ds-react';
import { SearchFieldButton } from '@navikt/ds-react/esm/form/search-field';
import fnrValidator from '@navikt/fnrvalidator';
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
    const [fnrValidation, setFnrValidation] = React.useState<ValidationResult | null>(null);
    const [inputErrorMessage, setInputErrorMsg] = React.useState<string | null>(null);

    React.useEffect(() => {
        setHasSubmitted(true);
        setFnrValidation(null);
        setInputErrorMsg(null);

        if (input.length !== 11) {
            props.onReset();
        }
    }, [input]);

    const lagFnrFeilmelding = (error: ErrorReason) => {
        switch (error) {
            case 'fnr or dnr must consist of 11 digits':
                return intl.formatMessage({ id: 'feilmelding.lengde' });
            case "checksums don't match":
            case 'invalid date':
                return intl.formatMessage({ id: 'feilmelding.ugyldig' });
        }
    };

    const handleSubmit = () => {
        if (!Number(input)) {
            return setInputErrorMsg(intl.formatMessage({ id: 'feilmelding.måVareTall' }));
        }

        if (input.length === 11) {
            return fetchSakByFnr();
        }

        props.onFetchBySaksnummer?.(input);
    };

    const fetchSakByFnr = () => {
        const validation = fnrValidator.fnr(input);
        setFnrValidation(validation);
        if (validation.status === 'valid') {
            props.onFetchByFnr(input);
        }
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
                        <SearchFieldInput
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
                        <SearchFieldButton type="submit">
                            <FormattedMessage id="knapp.søk" />
                        </SearchFieldButton>
                    </SearchField>
                    <SkjemaelementFeilmelding>
                        {hasSubmitted && fnrValidation?.status === 'invalid'
                            ? lagFnrFeilmelding(fnrValidation.reasons[0])
                            : undefined}
                        {hasSubmitted && inputErrorMessage}
                    </SkjemaelementFeilmelding>
                </div>
                <div className={styles.personkortWrapper}>
                    {pipe(
                        props.person,
                        RemoteData.fold(
                            () => null,
                            () => <Loader />,
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
