import * as RemoteData from '@devexperts/remote-data-ts';
import { NumberListIcon, CurrencyExchangeIcon, FileCheckmarkIcon, FileIcon } from '@navikt/aksel-icons';
import { Heading, Tabs } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { hentReguleringsstatus } from '~src/api/reguleringApi';
import { Person as PersonIkon } from '~src/assets/Icons';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Personsøk from '~src/components/Personsøk/Personsøk';
import * as personSlice from '~src/features/person/person.slice';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import messages from './behandlingsoversikt-nb';
import * as styles from './behandlingsoversikt.module.less';
import { FerdigeBehandlinger } from './ferdigeBehandlinger/FerdigeBehandlinger';
import Nøkkeltall from './nøkkeltall/Nøkkeltall';
import Reguleringsoversikt from './regulering/reguleringsoversikt';
import { ÅpneBehandlinger } from './åpneBehandlinger/ÅpneBehandlinger';

enum Tab {
    ÅPNE_BEHANDLINGER = 'ÅPNE_BEHANDLINGER',
    FERDIGE_BEHANDLINGER = 'FERDIGE_BEHANDLINGER',
    NØKKELTALL = 'NØKKELTALL',
    REGULERING = 'REGULERING',
}

const Behandlingsoversikt = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { søker } = useAppSelector((s) => ({ søker: s.personopplysninger.søker }));
    const [sakStatus, fetchSak, resetSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const [, fetchPerson] = useAsyncActionCreator(personSlice.fetchPerson);
    const { formatMessage } = useI18n({ messages });
    const [reguleringerOgMerknader, hentReguleringerOgMerknader] = useApiCall(hentReguleringsstatus);
    const gjenståendeManuelleReguleringer = RemoteData.isSuccess(reguleringerOgMerknader)
        ? reguleringerOgMerknader.value
        : [];

    useEffect(() => {
        hentReguleringerOgMerknader({});
    }, []);

    return (
        <div className={styles.saksoversiktForside}>
            <div className={styles.personsøk}>
                <Heading level="1" size="large" spacing className={styles.finnSak}>
                    <PersonIkon />
                    {formatMessage('finnSak')}
                </Heading>
                <Personsøk
                    onReset={() => {
                        dispatch(personSlice.default.actions.resetSøkerData());
                        resetSak();
                    }}
                    onFetchByFnr={(fnr) => {
                        fetchPerson({ fnr });
                        fetchSak({ fnr }, (res) => {
                            navigate(Routes.saksoversiktValgtSak.createURL({ sakId: res.id }));
                        });
                    }}
                    onFetchBySaksnummer={(saksnummer) => {
                        fetchSak({ saksnummer }, (res) => {
                            fetchPerson({ fnr: res.fnr }, () => {
                                navigate(Routes.saksoversiktValgtSak.createURL({ sakId: res.id }));
                            });
                        });
                    }}
                    onFetchBySakId={(sakId) => {
                        fetchSak({ sakId }, (res) => {
                            fetchPerson({ fnr: res.fnr }, () => {
                                navigate(Routes.saksoversiktValgtSak.createURL({ sakId: res.id }));
                            });
                        });
                    }}
                    person={søker}
                />
                {RemoteData.isFailure(sakStatus) && !RemoteData.isFailure(søker) && (
                    <ApiErrorAlert error={sakStatus.error} className={styles.feilmelding} />
                )}
            </div>

            <Tabs defaultValue={Tab.ÅPNE_BEHANDLINGER}>
                <Tabs.List>
                    <Tabs.Tab
                        value={Tab.ÅPNE_BEHANDLINGER}
                        label={formatMessage('åpneBehandlinger')}
                        icon={<FileIcon />}
                    />
                    <Tabs.Tab
                        value={Tab.FERDIGE_BEHANDLINGER}
                        label={formatMessage('ferdigeBehandlinger')}
                        icon={<FileCheckmarkIcon />}
                    />
                    <Tabs.Tab value={Tab.NØKKELTALL} label={formatMessage('nøkkeltall')} icon={<NumberListIcon />} />
                    <Tabs.Tab
                        value={Tab.REGULERING}
                        label={formatMessage('regulering')}
                        icon={<CurrencyExchangeIcon />}
                    />
                </Tabs.List>
                <div className={styles.tabcontainer}>
                    <Tabs.Panel value={Tab.ÅPNE_BEHANDLINGER}>
                        <ÅpneBehandlinger />
                    </Tabs.Panel>
                    <Tabs.Panel value={Tab.FERDIGE_BEHANDLINGER}>
                        <FerdigeBehandlinger />
                    </Tabs.Panel>
                    <Tabs.Panel value={Tab.NØKKELTALL}>
                        <Nøkkeltall />
                    </Tabs.Panel>
                    <Tabs.Panel value={Tab.REGULERING}>
                        <Reguleringsoversikt reguleringsstatus={gjenståendeManuelleReguleringer} />
                    </Tabs.Panel>
                </div>
            </Tabs>
        </div>
    );
};

export default Behandlingsoversikt;
