import * as RemoteData from '@devexperts/remote-data-ts';
import { PersonCard, Gender } from '@navikt/nap-person-card';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { useParams } from 'react-router-dom';

import { Kjønn } from '~api/personApi';
import { Languages } from '~components/TextProvider';
import * as personSlice from '~features/person/person.slice';
import { showName } from '~features/person/personUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import Søkefelt from '~pages/saksoversikt/søkefelt/Søkefelt';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import styles from '../saksoversikt/saksoversikt.module.less';

import messages from './attestering-nb';
import Attesteringsliste from './Attesteringsliste';

const Saksoversikt = () => {
    const { ...urlParams } = useParams<{
        sakId: string;
        stonadsperiodeId: string;
        behandlingId: string;
    }>();

    const { søker, sak } = useAppSelector((s) => ({ søker: s.søker.søker, sak: s.sak.sak }));
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (urlParams.sakId && RemoteData.isInitial(sak)) {
            dispatch(sakSlice.fetchSak({ sakId: urlParams.sakId }));
        }
    }, [sak._tag]);
    useEffect(() => {
        if (RemoteData.isSuccess(sak) && RemoteData.isInitial(søker)) {
            dispatch(personSlice.fetchPerson({ fnr: sak.value.fnr }));
        }
    }, [sak._tag, søker._tag]);

    const data = RemoteData.combine(søker, sak);

    const oversettKjønn = () => {
        if (RemoteData.isSuccess(søker)) {
            if (søker.value.kjønn === Kjønn.Mann) {
                return Gender.male;
            } else if (søker.value.kjønn === Kjønn.Kvinne) {
                return Gender.female;
            } else {
                return Gender.unknown;
            }
        }
        return Gender.unknown;
    };

    const [gender, setGender] = useState<Gender>(Gender.unknown);
    useEffect(() => {
        setGender(oversettKjønn());
    }, [søker._tag]);

    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            {!RemoteData.isSuccess(data) && (
                <div>
                    <Søkefelt historyUrl={'/attestering'} />
                    {RemoteData.isPending(data) && <NavFrontendSpinner />}
                    {RemoteData.isFailure(data) && <AlertStripe type="feil">{data.error.message}</AlertStripe>}
                </div>
            )}

            {pipe(
                data,
                RemoteData.map(([person, sak]) => (
                    <>
                        <div className={styles.headerContainer}>
                            <PersonCard fodselsnummer={person.fnr} gender={gender} name={showName(person)} />
                            <Søkefelt historyUrl={'/attestering'} />
                        </div>
                        <div className={styles.container}>
                            <div className={styles.mainContent}>
                                <Attesteringsliste sak={sak} />
                            </div>
                        </div>
                    </>
                )),
                RemoteData.getOrElse(() => <span />)
            )}
        </IntlProvider>
    );
};

export default Saksoversikt;
