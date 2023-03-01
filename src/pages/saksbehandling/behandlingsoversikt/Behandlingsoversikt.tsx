import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading } from '@navikt/ds-react';
import * as Tabs from '@radix-ui/react-tabs';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
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
import { Reguleringstype } from '~src/types/Regulering';

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
        ? reguleringerOgMerknader.value.filter(
              ({ regulering }) => !regulering.erFerdigstilt && regulering.reguleringstype === Reguleringstype.MANUELL
          )
        : [];

    useEffect(() => {
        hentReguleringerOgMerknader({});
    }, []);

    const tabsClassnames = (erAktiv: boolean) => {
        return classNames(
            styles['nav-frontend-tabs__tab-label'],
            styles['nav-frontend-tabs__tab-inner'],
            styles['nav-frontend-tabs__tab-inner--interaktiv'],
            {
                [styles['nav-frontend-tabs__tab-inner--aktiv']]: erAktiv,
            }
        );
    };

    const [aktivTab, setAktivTab] = useState<Tab>(Tab.ÅPNE_BEHANDLINGER);

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
                    person={søker}
                />

                {RemoteData.isFailure(sakStatus) && !RemoteData.isFailure(søker) && (
                    <ApiErrorAlert error={sakStatus.error} className={styles.feilmelding} />
                )}
            </div>

            <Tabs.Root
                className={classNames(styles['nav-frontend-tabs'], styles['tab-list'])}
                defaultValue={aktivTab}
                onValueChange={(tab) => setAktivTab(tab as Tab)}
            >
                <Tabs.List>
                    <Tabs.Trigger
                        className={tabsClassnames(aktivTab === Tab.ÅPNE_BEHANDLINGER)}
                        value={Tab.ÅPNE_BEHANDLINGER}
                    >
                        {formatMessage('åpneBehandlinger')}
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        className={tabsClassnames(aktivTab === Tab.FERDIGE_BEHANDLINGER)}
                        value={Tab.FERDIGE_BEHANDLINGER}
                    >
                        {formatMessage('ferdigeBehandlinger')}
                    </Tabs.Trigger>
                    <Tabs.Trigger className={tabsClassnames(aktivTab === Tab.NØKKELTALL)} value={Tab.NØKKELTALL}>
                        {formatMessage('nøkkeltall')}
                    </Tabs.Trigger>
                    {gjenståendeManuelleReguleringer.length > 0 && (
                        <Tabs.Trigger className={tabsClassnames(aktivTab === Tab.REGULERING)} value={Tab.REGULERING}>
                            {formatMessage('regulering')}
                        </Tabs.Trigger>
                    )}
                </Tabs.List>
            </Tabs.Root>
            <div className={styles.tabcontainer}>
                {aktivTab === Tab.ÅPNE_BEHANDLINGER && <ÅpneBehandlinger />}
                {aktivTab === Tab.FERDIGE_BEHANDLINGER && <FerdigeBehandlinger />}
                {aktivTab === Tab.NØKKELTALL && <Nøkkeltall />}
                {aktivTab === Tab.REGULERING && (
                    <Reguleringsoversikt reguleringsstatus={gjenståendeManuelleReguleringer} />
                )}
            </div>
        </div>
    );
};

export default Behandlingsoversikt;
