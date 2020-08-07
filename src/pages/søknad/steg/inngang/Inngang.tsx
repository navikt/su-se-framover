import * as RemoteData from '@devexperts/remote-data-ts';
import fnrValidator from '@navikt/fnrvalidator';
import AlertStripe from 'nav-frontend-alertstriper';
import { Søkeknapp } from 'nav-frontend-ikonknapper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Input, Label, SkjemaelementFeilmelding } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Personkort } from '~components/Personkort';
import * as personSlice from '~features/person/person.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import nb from './inngang-nb';
import styles from './inngang.module.less';

const index = (props: { nesteUrl: string }) => {
    const { søker } = useAppSelector((s) => s.søker);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const intl = useI18n({ messages: { ...sharedI18n, ...nb } });

    const [fnr, setFnr] = React.useState('');

    const [fnrValidation, setFnrValidation] = React.useState<ValidationResult | null>(null);

    React.useEffect(() => {
        const validation = fnrValidator.fnr(fnr);
        setFnrValidation(validation);
        if (fnr.length !== 11) {
            dispatch(personSlice.default.actions.resetSøker());
        }
    }, [fnr]);

    const handleSubmit = () => {
        setHasSubmitted(true);
        const validation = fnrValidator.fnr(fnr);
        setFnrValidation(validation);

        if (validation.status === 'valid') {
            dispatch(personSlice.fetchPerson({ fnr }));
        }
    };

    const handleStartSøknadClick = () => {
        if (RemoteData.isSuccess(søker)) {
            history.push(props.nesteUrl);
        }
    };

    const lagFeilmelding = (error: ErrorReason) => {
        switch (error) {
            case 'fnr or dnr must consist of 11 digits':
                return intl.formatMessage({ id: 'feilmelding.lengde' });
            case "checksums don't match":
            case 'invalid date':
                return intl.formatMessage({ id: 'feilmelding.ugyldig' });
        }
    };
    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
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
                            søker,
                            RemoteData.fold(
                                () => null,
                                () => <NavFrontendSpinner />,
                                (err) => <AlertStripe type="feil">{err.message}</AlertStripe>,
                                (s) => <Personkort person={s} />
                            )
                        )}
                    </div>
                </form>

                {RemoteData.isSuccess(søker) && (
                    <div className={styles.successknapper}>
                        <Hovedknapp htmlType="button" onClick={handleStartSøknadClick}>
                            <FormattedMessage id="knapp.startSøknad" />
                        </Hovedknapp>
                    </div>
                )}
            </div>
        </RawIntlProvider>
    );
};

export default index;
