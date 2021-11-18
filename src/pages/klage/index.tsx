import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Sak } from '~types/Sak';

import BehandlingAvKlage from './behandlingAvKlage/BehandlingAvKlage';
//import OpprettKlage from './OpprettKlage';
import messages from './klage-nb';
import VurderFormkrav from './VurderFormkrav';

const Klage = (props: { sak: Sak }) => {
    const urlParams = Routes.useRouteParams<typeof Routes.klage>();
    const klage = props.sak.klager.find((klage) => klage.id === urlParams.klageId);
    const { formatMessage } = useI18n({ messages });

    if (!klage) {
        return <div>{formatMessage('feil.fantIkkeKlage')}</div>;
    }

    return (
        <div>
            <Switch>
                <Route
                    path={Routes.klage.createURL({ sakId: props.sak.id, klageId: klage.id, steg: KlageSteg.Formkrav })}
                >
                    <VurderFormkrav sak={props.sak} klage={klage} />
                </Route>
                <Route
                    path={Routes.klage.createURL({
                        sakId: props.sak.id,
                        klageId: klage.id,
                        steg: KlageSteg.Behandling,
                    })}
                >
                    <BehandlingAvKlage sak={props.sak} klage={klage} />
                </Route>
            </Switch>
        </div>
    );
};

export default Klage;
