import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Vilkårtype } from '~api/behandlingApi';
import { Sak } from '~api/sakApi';
import * as Routes from '~lib/routes';

import Flyktning from './Flyktning';
import Framdriftsindikator from './Framdriftsindikator';
import Uførhet from './Uførhet';
import styles from './v2.module.less';

const Vilkår = (props: { sak: Sak }) => {
    const { vilkar = Vilkårtype.Uførhet, ...urlParams } = Routes.useRouteParams<
        typeof Routes.saksbehandlingVilkårsvurdering
    >();
    const behandling = props.sak.behandlinger.find((b) => b.id === urlParams.behandlingId);

    if (!(behandling && urlParams.sakId && urlParams.behandlingId)) {
        return <div>404</div>;
    }

    const createVilkårUrl = (v: Vilkårtype) =>
        Routes.saksbehandlingVilkårsvurdering.createURL({
            behandlingId: urlParams.behandlingId,
            sakId: urlParams.sakId,
            vilkar: v,
        });

    return (
        <div className={styles.container}>
            <div className={styles.framdriftsindikator}>
                <Framdriftsindikator behandling={behandling} vilkår={vilkar} />
            </div>
            <div className={styles.content}>
                <Switch>
                    <Route path={createVilkårUrl(Vilkårtype.Uførhet)}>
                        <Uførhet
                            behandling={behandling}
                            forrigeUrl={Routes.saksoversiktValgtSak.createURL({
                                sakId: urlParams.sakId,
                            })}
                            nesteUrl={createVilkårUrl(Vilkårtype.Flyktning)}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.Flyktning)}>
                        <Flyktning
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.Uførhet)}
                            nesteUrl={createVilkårUrl(Vilkårtype.Flyktning)}
                        />
                    </Route>
                    <Route path="*">404</Route>
                </Switch>
            </div>
        </div>
    );
};

export default Vilkår;
