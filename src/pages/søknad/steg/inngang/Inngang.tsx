import * as RemoteData from '@devexperts/remote-data-ts';
import { Hovedknapp } from 'nav-frontend-knapper';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import Personsøk from '~components/Personsøk/Personsøk';
import * as personSlice from '~features/person/person.slice';
import søknadSlice from '~features/søknad/søknad.slice';
import { useI18n } from '~lib/hooks';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import sharedStyles from '../../steg-shared.module.less';

import nb from './inngang-nb';
import styles from './inngang.module.less';

const index = (props: { nesteUrl: string }) => {
    const { søker } = useAppSelector((s) => s.søker);
    const dispatch = useAppDispatch();
    const history = useHistory();

    const intl = useI18n({ messages: nb });

    React.useEffect(() => {
        dispatch(søknadSlice.actions.resetSøknad());
    }, [søker]);

    const handleStartSøknadClick = () => {
        if (RemoteData.isSuccess(søker)) {
            history.push(props.nesteUrl);
        }
    };

    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
                <Personsøk
                    onReset={() => {
                        dispatch(personSlice.default.actions.resetSøker());
                    }}
                    onSubmit={(fnr) => {
                        dispatch(personSlice.fetchPerson({ fnr }));
                    }}
                    person={søker}
                />

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
