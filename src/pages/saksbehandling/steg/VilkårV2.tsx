import React from 'react';
import { Route, Switch } from 'react-router-dom';

import * as Routes from '~lib/routes';
import { Behandlingsstatus } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Vilkårtype } from '~types/Vilkårsvurdering';

import Beregning from './beregning/Beregning';
import FastOppholdINorge from './fast-opphold-i-norge/FastOppholdINorge';
import Flyktning from './flyktning/Flyktning';
import Formue from './formue/Formue';
import Framdriftsindikator from './Framdriftsindikator';
import LovligOppholdINorge from './lovlig-opphold-i-norge/LovligOppholdINorge';
import OppholdIUtlandet from './opphold-i-utlandet/OppholdIUtlandet';
import PersonligOppmøte from './personlig-oppmøte/PersonligOppmøte';
import Sats from './sats/Sats';
import Uførhet from './uførhet/Uførhet';
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
                            forrigeUrl={createVilkårUrl(Vilkårtype.LovligOpphold)}
                            nesteUrl={createVilkårUrl(Vilkårtype.OppholdIUtlandet)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.OppholdIUtlandet)}>
                        <OppholdIUtlandet
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.FastOppholdINorge)}
                            nesteUrl={createVilkårUrl(Vilkårtype.Formue)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.Formue)}>
                        <Formue
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.OppholdIUtlandet)}
                            nesteUrl={createVilkårUrl(Vilkårtype.PersonligOppmøte)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.PersonligOppmøte)}>
                        <PersonligOppmøte
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.Formue)}
                            nesteUrl={createVilkårUrl(Vilkårtype.Sats)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.Sats)}>
                        <Sats
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.PersonligOppmøte)}
                            nesteUrl={
                                behandling.status == Behandlingsstatus.VILKÅRSVURDERT_AVSLAG
                                    ? Routes.saksbehandlingVedtak.createURL({
                                          sakId: urlParams.sakId,
                                          behandlingId: behandling.id,
                                      })
                                    : createVilkårUrl(Vilkårtype.Beregning)
                            }
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={createVilkårUrl(Vilkårtype.Beregning)}>
                        <Beregning
                            behandling={behandling}
                            forrigeUrl={createVilkårUrl(Vilkårtype.Sats)}
                            nesteUrl={Routes.saksbehandlingVedtak.createURL({
                                sakId: urlParams.sakId,
                                behandlingId: behandling.id,
                            })}
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
