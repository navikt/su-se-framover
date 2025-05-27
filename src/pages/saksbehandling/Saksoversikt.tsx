import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader } from '@navikt/ds-react';
import { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { Outlet, useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Personlinje from '~src/components/personlinje/Personlinje';
import * as personSlice from '~src/features/person/person.slice';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { Languages } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import Saksvarsler from './sakintro/saksvarsler/Saksvarsler';
import messages from './saksoversikt-nb';
import styles from './saksoversikt.module.less';

const Saksoversikt = () => {
    const urlParams = routes.useRouteParams<typeof routes.saksoversiktValgtSak>();
    const navigate = useNavigate();

    const { søker, sak } = useAppSelector((s) => ({ søker: s.personopplysninger.søker, sak: s.sak.sak }));
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (urlParams.sakId) {
            dispatch(sakSlice.fetchSakByIdEllerNummer({ sakId: urlParams.sakId }));
        }
    }, []);

    useEffect(() => {
        if (RemoteData.isSuccess(sak)) {
            if (RemoteData.isInitial(søker)) {
                dispatch(personSlice.fetchPerson({ fnr: sak.value.fnr }));
            } else if (RemoteData.isSuccess(søker) && !urlParams.sakId) {
                navigate(routes.saksoversiktValgtSak.createURL({ sakId: sak.value.id }));
            }
        }
    }, [sak._tag, søker._tag]);

    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            {pipe(
                RemoteData.combine(søker, sak),
                RemoteData.fold(
                    () => null,
                    () => <Loader />,
                    () =>
                        RemoteData.isFailure(søker) ? (
                            <ApiErrorAlert error={søker.error} />
                        ) : (
                            RemoteData.isFailure(sak) && <ApiErrorAlert error={sak.error} />
                        ),
                    ([søker, sak]) => (
                        <div className={styles.saksoversiktContainer}>
                            <Personlinje
                                søker={søker}
                                sakInfo={{ sakId: sak.id, saksnummer: sak.saksnummer, sakstype: sak.sakstype }}
                            />
                            <Saksvarsler sak={sak} søker={søker} />
                            <div className={styles.container}>
                                <Outlet context={{ sak, søker }} />
                            </div>
                        </div>
                    ),
                ),
            )}
        </IntlProvider>
    );
};

export default Saksoversikt;
