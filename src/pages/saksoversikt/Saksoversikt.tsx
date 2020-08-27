import * as RemoteData from '@devexperts/remote-data-ts';
import { PersonCard, Gender } from '@navikt/nap-person-card';
import classNames from 'classnames';
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
import { useAppSelector, useAppDispatch } from '~redux/Store';

import Beregning from './beregning/Beregning';
import Sakintro from './sakintro/Sakintro';
import messages from './saksoversikt-nb';
import styles from './saksoversikt.module.less';
import Søkefelt from './søkefelt/Søkefelt';
import { SaksbehandlingMenyvalg } from './types';
import Vedtak from './vedtak/Vedtak';
import Vilkår from './vilkår/Vilkår';

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
                3.&nbsp;Vedtak
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
                    <Søkefelt historyUrl={'/saksoversikt'} />
                    {RemoteData.isPending(data) && <NavFrontendSpinner />}
                    {RemoteData.isFailure(data) && <AlertStripe type="feil">{data.error.message}</AlertStripe>}
                </div>
            )}

            {pipe(
                data,
                RemoteData.map(([data, sak]) => (
                    <>
                        <div className={styles.headerContainer}>
                            <PersonCard fodselsnummer={data.fnr} gender={gender} name={showName(data)} />
                            <Søkefelt historyUrl={'/saksoversikt'} />
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
                                    <Vedtak sak={sak} behandlingId={urlParams.behandlingId} />
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
