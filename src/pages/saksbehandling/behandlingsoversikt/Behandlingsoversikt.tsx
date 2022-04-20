import { Heading } from '@navikt/ds-react';
import * as Tabs from '@radix-ui/react-tabs';
import classNames from 'classnames';
import * as A from 'fp-ts/Array';
import React, { useEffect, useState } from 'react';

import { hentReguleringsstatus } from '~src/api/reguleringApi';
import { Person as PersonIkon } from '~src/assets/Icons';
import Personsøk from '~src/components/Personsøk/Personsøk';
import * as personSlice from '~src/features/person/person.slice';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Regulering, Reguleringstype } from '~src/types/Regulering';

import messages from './behandlingsoversikt-nb';
import * as styles from './behandlingsoversikt.module.less';
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

enum Tab {
    ÅPNE_BEHANDLINGER = 'ÅPNE_BEHANDLINGER',
    FERDIGE_BEHANDLINGER = 'FERDIGE_BEHANDLINGER',
    NØKKELTALL = 'NØKKELTALL',
    REGULERING = 'REGULERING',
}

const Behandlingsoversikt = () => {
    const dispatch = useAppDispatch();
    const { søker } = useAppSelector((s) => ({ søker: s.søker.søker }));
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

export default Behandlingsoversikt;
