import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { useHistory, useParams } from 'react-router-dom';
import AlertStripe from 'nav-frontend-alertstriper';

import * as RemoteData from '@devexperts/remote-data-ts';
import { PersonCard } from '@navikt/nap-person-card';
import SideMenu from '@navikt/nap-side-menu';

import NavFrontendSpinner from 'nav-frontend-spinner';

import { Languages } from '~components/TextProvider';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { pipe } from '~lib/fp';

import messages from './saksoversikt-nb';
import Søkefelt from './søkefelt/Søkefelt';
import { SaksbehandlingMenyvalg } from './types';

import styles from './saksoversikt.module.less';
import Sakintro from './sakintro/Sakintro';
import Vilkår from './vilkår/Vilkår';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import * as personSlice from '~features/person/person.slice';
import * as routes from '~lib/routes';

const Saksoversikt = () => {
    const { meny, ...urlParams } = useParams<{
        meny: SaksbehandlingMenyvalg;
        sakId: string;
        stonadsperiodeId: string;
        behandlingId: string;
    }>();

    const { søker, sak } = useAppSelector((s) => ({ søker: s.søker.søker, sak: s.sak.sak }));
    const history = useHistory();
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

    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            {!RemoteData.isSuccess(data) && (
                <div>
                    <Søkefelt />
                    {RemoteData.isPending(data) && <NavFrontendSpinner />}
                    {RemoteData.isFailure(data) && <AlertStripe type="feil">{data.error.message}</AlertStripe>}
                </div>
            )}

            {pipe(
                data,
                RemoteData.map(([data, sak]) => (
                    <>
                        <div className={styles.headerContainer}>
                            <PersonCard
                                fodselsnummer={data.fnr}
                                gender="unknown"
                                name={`${data.fornavn} ${data.etternavn}`}
                            />
                            <Søkefelt />
                        </div>
                        <div className={styles.container}>
                            {meny && (
                                <SideMenu
                                    links={[
                                        {
                                            label: 'Søknad',
                                            active: meny === SaksbehandlingMenyvalg.Søknad,
                                        },
                                        {
                                            label: 'Vilkår',
                                            active: meny === SaksbehandlingMenyvalg.Vilkår,
                                        },
                                        {
                                            label: 'Beregning',
                                            active: meny === SaksbehandlingMenyvalg.Beregning,
                                        },
                                        {
                                            label: 'Vedtak',
                                            active: meny === SaksbehandlingMenyvalg.Vedtak,
                                        },
                                    ]}
                                    onClick={(index) => {
                                        const menuItem = [
                                            SaksbehandlingMenyvalg.Søknad,
                                            SaksbehandlingMenyvalg.Vilkår,
                                            SaksbehandlingMenyvalg.Beregning,
                                            SaksbehandlingMenyvalg.Vedtak,
                                        ][index];

                                        if (!menuItem) {
                                            return;
                                        }

                                        history.push(
                                            routes.saksoversikt.createURL({
                                                behandlingId: urlParams.behandlingId,
                                                sakId: sak.id,
                                                meny: menuItem,
                                            })
                                        );
                                    }}
                                />
                            )}
                            <div className={styles.mainContent}>
                                {meny === SaksbehandlingMenyvalg.Søknad ? (
                                    'Her kan vi kanskje vise hele søknaden'
                                ) : meny === SaksbehandlingMenyvalg.Vilkår ? (
                                    <Vilkår
                                        sakId={sak.id}
                                        behandling={sak.behandlinger.find((b) => b.id === urlParams.behandlingId)}
                                    />
                                ) : meny === SaksbehandlingMenyvalg.Beregning ? (
                                    'beregning'
                                ) : meny === SaksbehandlingMenyvalg.Vedtak ? (
                                    'vedtak'
                                ) : (
                                    <Sakintro sak={sak} />
                                )}
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
