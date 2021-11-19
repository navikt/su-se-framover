import { Heading } from '@navikt/ds-react';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Framdriftsindikator, { Linjestatus } from '~components/framdriftsindikator/Framdriftsindikator';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Sak } from '~types/Sak';

import BehandlingAvKlage from './behandlingAvKlage/BehandlingAvKlage';
import messages from './klage-nb';
import styles from './klage.module.less';
import VurderFormkrav from './VurderFormkrav';

const Klage = (props: { sak: Sak }) => {
    const urlParams = Routes.useRouteParams<typeof Routes.klage>();
    const klage = props.sak.klager.find((klage) => klage.id === urlParams.klageId);
    const { formatMessage } = useI18n({ messages });

    if (!klage) {
        return <div>{formatMessage('feil.fantIkkeKlage')}</div>;
    }

    //TODO - gjør litt mapping, og fortell pc'en at den skal være smart
    const linjer = [
        {
            id: KlageSteg.Formkrav,
            status: Linjestatus.Ingenting,
            label: 'Formkrav',
            url: Routes.klage.createURL({ sakId: props.sak.id, klageId: klage.id, steg: KlageSteg.Formkrav }),
            erKlikkbar: false,
        },
        {
            id: KlageSteg.Behandling,
            status: Linjestatus.Ingenting,
            label: 'Vurdering',
            url: Routes.klage.createURL({ sakId: props.sak.id, klageId: klage.id, steg: KlageSteg.Behandling }),
            erKlikkbar: false,
        },
    ];

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="xlarge" className={styles.pageTittel}>
                {formatMessage('page.tittel')}
            </Heading>
            <div className={styles.klageContainerMedFramdriftsindikator}>
                <div>
                    <Framdriftsindikator aktivId={urlParams.steg} elementer={linjer} />
                </div>
                <Switch>
                    <Route
                        path={Routes.klage.createURL({
                            sakId: props.sak.id,
                            klageId: klage.id,
                            steg: KlageSteg.Formkrav,
                        })}
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
        </div>
    );
};

export default Klage;
