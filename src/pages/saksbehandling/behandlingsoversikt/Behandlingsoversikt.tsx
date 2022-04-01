import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading } from '@navikt/ds-react';
import * as Tabs from '@radix-ui/react-tabs';
import classNames from 'classnames';
import * as A from 'fp-ts/Array';
import React, { useEffect, useState } from 'react';

import { Person } from '~api/personApi';
import { hentReguleringsstatus } from '~api/reguleringApi';
import { Person as PersonIkon } from '~assets/Icons';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Personsøk from '~components/Personsøk/Personsøk';
import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { ApiResult, useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { useAppDispatch } from '~redux/Store';
import { Regulering, Reguleringstype } from '~types/Regulering';
import { Sak } from '~types/Sak';

import messages from './behandlingsoversikt-nb';
import styles from './behandlingsoversikt.module.less';
import { FerdigeBehandlinger } from './ferdigeBehandlinger/FerdigeBehandlinger';
import Nøkkeltall from './nøkkeltall/Nøkkeltall';
import Reguleringsoversikt from './regulering/reguleringsoversikt';
import { ÅpneBehandlinger } from './åpneBehandlinger/ÅpneBehandlinger';

const splittAutomatiskeOgManuelleReguleringer = (reguleringer: Regulering[]) => {
    return pipe(
        reguleringer,
        A.partition((regulering) => regulering.reguleringstype === Reguleringstype.AUTOMATISK),
        ({ left, right }) => ({
            automatiske: right,
            manuelle: left,
        })
    );
};

interface Props {
    søker: ApiResult<Person>;
    sak: ApiResult<Sak>;
}

enum Tab {
    ÅPNE_BEHANDLINGER = 'ÅPNE_BEHANDLINGER',
    FERDIGE_BEHANDLINGER = 'FERDIGE_BEHANDLINGER',
    NØKKELTALL = 'NØKKELTALL',
    REGULERING = 'REGULERING',
}

export const Behandlingsoversikt = ({ sak, søker }: Props) => {
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages });
    const [, hentReguleringer] = useApiCall(hentReguleringsstatus);
    const [reguleringer, setReguleringer] = useState<{ automatiske: Regulering[]; manuelle: Regulering[] }>({
        automatiske: [],
        manuelle: [],
    });
    const gjenståendeReguleringer = reguleringer.manuelle.filter((m) => !m.erFerdigstilt);

    useEffect(() => {
        hentReguleringer({}, (r) => {
            setReguleringer(splittAutomatiskeOgManuelleReguleringer(r));
        });
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
                        dispatch(personSlice.default.actions.resetSøker());
                        dispatch(sakSlice.default.actions.resetSak());
                    }}
                    onFetchByFnr={(fnr) => {
                        dispatch(personSlice.fetchPerson({ fnr }));
                        dispatch(sakSlice.fetchSak({ fnr }));
                    }}
                    onFetchBySaksnummer={async (saksnummer) => {
                        const res = await dispatch(sakSlice.fetchSak({ saksnummer }));
                        if (sakSlice.fetchSak.fulfilled.match(res)) {
                            dispatch(personSlice.fetchPerson({ fnr: res.payload.fnr }));
                        }
                    }}
                    person={søker}
                />
                {RemoteData.isFailure(sak) && !RemoteData.isFailure(søker) && (
                    <ApiErrorAlert className={styles.alert} error={sak.error} />
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
                    {gjenståendeReguleringer.length > 0 && (
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
                {aktivTab === Tab.REGULERING && <Reguleringsoversikt manuelle={reguleringer.manuelle} />}
            </div>
        </div>
    );
};
