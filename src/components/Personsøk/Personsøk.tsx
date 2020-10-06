import * as RemoteData from '@devexperts/remote-data-ts';
import fnrValidator from '@navikt/fnrvalidator';
import AlertStripe from 'nav-frontend-alertstriper';
import { Søkeknapp } from 'nav-frontend-ikonknapper';
import { Input, Label, SkjemaelementFeilmelding } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';

import { ApiError, ErrorCode } from '~api/apiClient';
import { Person } from '~api/personApi';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';

import { Personkort } from '../Personkort';

import messages from './personsøk-nb';
import styles from './personsøk.module.less';

interface PersonsøkProps {
    person: RemoteData.RemoteData<ApiError, Person>;
    onSubmit(fnr: string): void;
    onReset(): void;
}

const Personsøk = (props: PersonsøkProps) => {
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const intl = useI18n({ messages });

    const [fnr, setFnr] = React.useState('');
    const [fnrValidation, setFnrValidation] = React.useState<ValidationResult | null>(null);

    React.useEffect(() => {
        const validation = fnrValidator.fnr(fnr);
        setFnrValidation(validation);
        if (fnr.length !== 11) {
            props.onReset();
        }
    }, [fnr]);
    const lagFeilmelding = (error: ErrorReason) => {
        switch (error) {
            case 'fnr or dnr must consist of 11 digits':
                return intl.formatMessage({ id: 'feilmelding.lengde' });
            case "checksums don't match":
            case 'invalid date':
                return intl.formatMessage({ id: 'feilmelding.ugyldig' });
        }
    };

    const handleSubmit = () => {
        setHasSubmitted(true);
        const validation = fnrValidator.fnr(fnr);
        setFnrValidation(validation);

        if (validation.status === 'valid') {
            props.onSubmit(fnr);
        }
    };

    return (
        <RawIntlProvider value={intl}>
            <form
                className={styles.formContainer}
                onSubmit={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <div className={styles.inputContainer}>
                    <Label htmlFor="fnr">
                        <FormattedMessage id={'input.fnr.label'} />
                    </Label>
                    <div className={styles.inputfeltcontainer}>
                        <Input
                            id="fnr"
                            name="fnr"
                            className={styles.inputfelt}
                            onChange={(e) => {
                                setFnr(e.target.value);
                            }}
                            value={fnr}
                        />
                        <Søkeknapp htmlType="submit">
                            <FormattedMessage id="knapp.søk" />
                        </Søkeknapp>
                    </div>
                    <SkjemaelementFeilmelding>
                        {hasSubmitted && fnrValidation?.status === 'invalid'
                            ? lagFeilmelding(fnrValidation.reasons[0])
                            : undefined}{' '}
                    </SkjemaelementFeilmelding>
                </div>
                <div className={styles.personkortWrapper}>
                    {pipe(
                        props.person,
                        RemoteData.fold(
                            () => null,
                            () => <NavFrontendSpinner />,
                            (err) => (
                                <AlertStripe type="feil">
                                    {err.statusCode === ErrorCode.Unauthorized
                                        ? intl.formatMessage({ id: 'feilmelding.ikkeTilgang' })
                                        : err.statusCode === ErrorCode.NotFound
                                        ? intl.formatMessage({ id: 'feilmelding.ikkeFunnet' })
                                        : intl.formatMessage({ id: 'feilmelding.ukjent' })}
                                </AlertStripe>
                            ),
                            (s) => <Personkort person={s} />
                        )
                    )}
                </div>
            </form>
        </RawIntlProvider>
    );
};

export default Personsøk;
