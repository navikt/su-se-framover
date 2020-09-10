import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Vilkårtype } from '~api/behandlingApi';
import { Sak } from '~api/sakApi';
import * as Routes from '~lib/routes';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';

import FastOppholdINorge from './FastOppholdINorge';
import Flyktning from './Flyktning';
import Formue from './Formue';
import Framdriftsindikator from './Framdriftsindikator';
import LovligOppholdINorge from './LovligOppholdINorge';
import PersonligOppmøte from './PersonligOppmøte';
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
                <Framdriftsindikator behandling={behandling} vilkår={vilkar as keyof Behandlingsinformasjon} />
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
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.Flyktning)}>
                        <Flyktning
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.Uførhet)}
                            nesteUrl={createVilkårUrl(Vilkårtype.LovligOpphold)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.LovligOpphold)}>
                        <LovligOppholdINorge
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.Flyktning)}
                            nesteUrl={createVilkårUrl(Vilkårtype.FastOppholdINorge)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.FastOppholdINorge)}>
                        <FastOppholdINorge
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.Oppholdstillatelse)}
                            nesteUrl={createVilkårUrl(Vilkårtype.Formue)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.Formue)}>
                        <Formue
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.BorOgOppholderSegINorge)}
                            nesteUrl={createVilkårUrl(Vilkårtype.PersonligOppmøte)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.PersonligOppmøte)}>
                        <PersonligOppmøte
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.Formue)}
                            nesteUrl={createVilkårUrl(Vilkårtype.PersonligOppmøte)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path="*">404</Route>
                </Switch>
            </div>
        </div>
    );
};

export default Vilkår;
