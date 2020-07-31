import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { useParams } from 'react-router-dom';
import AlertStripe from 'nav-frontend-alertstriper';

import * as RemoteData from '@devexperts/remote-data-ts';
import { PersonCard } from '@navikt/nap-person-card';

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
import Beregning from './beregning/Beregning';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import * as personSlice from '~features/person/person.slice';
import classNames from 'classnames';

const Meny = (props: { aktiv: SaksbehandlingMenyvalg }) => (
    <div className={styles.meny}>
        <ol>
            <li
                className={classNames(styles.menyItem, {
                    [styles.aktiv]: props.aktiv === SaksbehandlingMenyvalg.Vilkår,
                })}
            >
                1.&nbsp;Vilkår
            </li>
            <li
                className={classNames(styles.menyItem, {
                    [styles.aktiv]: props.aktiv === SaksbehandlingMenyvalg.Beregning,
                })}
            >
                2.&nbsp;Beregning
            </li>
            <li
                className={classNames(styles.menyItem, {
                    [styles.aktiv]: props.aktiv === SaksbehandlingMenyvalg.Vedtak,
                })}
            >
                3.&nbsp;Vedtaksbrev
            </li>
        </ol>
    </div>
);

const Saksoversikt = () => {
    const { meny, ...urlParams } = useParams<{
        meny: SaksbehandlingMenyvalg;
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
                            <Meny aktiv={meny} />
                            <div className={styles.mainContent}>
                                {meny === SaksbehandlingMenyvalg.Søknad ? (
                                    'Her kan vi kanskje vise hele søknaden'
                                ) : meny === SaksbehandlingMenyvalg.Vilkår ? (
                                    <Vilkår
                                        sakId={sak.id}
                                        behandling={sak.behandlinger.find((b) => b.id === urlParams.behandlingId)}
                                    />
                                ) : meny === SaksbehandlingMenyvalg.Beregning ? (
                                    <Beregning sak={sak} behandlingId={urlParams.behandlingId} />
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
