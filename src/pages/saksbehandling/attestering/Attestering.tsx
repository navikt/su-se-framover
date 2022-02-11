import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import Personlinje from '~components/personlinje/Personlinje';
import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { erInformasjonsRevurdering } from '~utils/revurdering/revurderingUtils';

import messages from './attestering-nb';
import styles from './attestering.module.less';
import AttesterKlage from './attesterKlage/AttesterKlage';
import AttesterRevurdering from './attesterRevurdering/AttesterRevurdering';
import AttesterSøknadsbehandling from './attesterSøknadsbehandling/AttesterSøknadsbehandling';

const Attestering = () => {
    const dispatch = useAppDispatch();
    const urlParams = Routes.useRouteParams<typeof Routes.attestering>();
    const { formatMessage } = useI18n({ messages });
    const { sak, søker } = useAppSelector((s) => ({ sak: s.sak.sak, søker: s.søker.søker }));

    useEffect(() => {
        if (RemoteData.isInitial(sak)) {
            dispatch(sakSlice.fetchSak({ sakId: urlParams.sakId }));
        }
    }, [sak._tag]);

    useEffect(() => {
        if (RemoteData.isSuccess(sak) && RemoteData.isInitial(søker)) {
            dispatch(personSlice.fetchPerson({ fnr: sak.value.fnr }));
        }
    }, [søker._tag, sak._tag]);

    return pipe(
        RemoteData.combine(sak, søker),
        RemoteData.fold(
            () => null,
            () => <Loader />,
            (_err) => <Alert variant="error">{formatMessage('feil.generisk')}</Alert>,
            ([sakValue, søkerValue]) => (
                <div className={styles.attesteringsSideContainer}>
                    <Personlinje
                        søker={søkerValue}
                        sakInfo={{
                            sakId: sakValue.id,
                            saksnummer: sakValue.saksnummer,
                        }}
                    />
                    <div className={styles.attesteringsKomponentContainer}>
                        <Switch>
                            <Route path={Routes.attesterSøknadsbehandling.path}>
                                <AttesterSøknadsbehandling sak={sakValue} søker={søkerValue} />
                            </Route>
                            <Route path={Routes.attesterRevurdering.path}>
                                <AttesterRevurdering
                                    sakInfo={{ sakId: sakValue.id, saksnummer: sakValue.saksnummer }}
                                    informasjonsRevurderinger={sakValue.revurderinger.filter(erInformasjonsRevurdering)}
                                />
                            </Route>
                            <Route path={Routes.attesterKlage.path}>
                                <AttesterKlage
                                    sakId={sakValue.id}
                                    klager={sakValue.klager}
                                    vedtaker={sakValue.vedtak}
                                />
                            </Route>
                        </Switch>
                    </div>
                </div>
            )
        )
    );
};

export default Attestering;
