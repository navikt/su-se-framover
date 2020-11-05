import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { createVilkårUrl } from '~features/saksoversikt/utils';
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
import styles from './vilkår.module.less';

const Vilkår = (props: { sak: Sak }) => {
    const { vilkar = Vilkårtype.Uførhet, ...urlParams } = Routes.useRouteParams<
        typeof Routes.saksbehandlingVilkårsvurdering
    >();
    const behandling = props.sak.behandlinger.find((b) => b.id === urlParams.behandlingId);

    if (!(behandling && urlParams.sakId && urlParams.behandlingId)) {
        return <div>404</div>;
    }

    const vilkårUrl = (vilkårType: Vilkårtype) =>
        createVilkårUrl({
            behandlingId: urlParams.behandlingId,
            sakId: urlParams.sakId,
            vilkar: vilkårType,
        });

    const vedtakUrl = Routes.saksbehandlingVedtak.createURL({
        sakId: urlParams.sakId,
        behandlingId: behandling.id,
    });

    const saksoversiktUrl = Routes.saksoversiktValgtSak.createURL({
        sakId: urlParams.sakId,
    });

    return (
        <div className={styles.container}>
            <Framdriftsindikator behandling={behandling} vilkår={vilkar} />
            <div className={styles.content}>
                <Switch>
                    <Route path={vilkårUrl(Vilkårtype.Uførhet)}>
                        <Uførhet
                            behandling={behandling}
                            forrigeUrl={saksoversiktUrl}
                            nesteUrl={vilkårUrl(Vilkårtype.Flyktning)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.Flyktning)}>
                        <Flyktning
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Uførhet)}
                            nesteUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.LovligOpphold)}>
                        <LovligOppholdINorge
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Flyktning)}
                            nesteUrl={vilkårUrl(Vilkårtype.FastOppholdINorge)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.FastOppholdINorge)}>
                        <FastOppholdINorge
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            nesteUrl={vilkårUrl(Vilkårtype.OppholdIUtlandet)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.OppholdIUtlandet)}>
                        <OppholdIUtlandet
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.FastOppholdINorge)}
                            nesteUrl={vilkårUrl(Vilkårtype.Formue)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.Formue)}>
                        <Formue
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.OppholdIUtlandet)}
                            nesteUrl={vilkårUrl(Vilkårtype.PersonligOppmøte)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.PersonligOppmøte)}>
                        <PersonligOppmøte
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Formue)}
                            nesteUrl={vilkårUrl(Vilkårtype.Sats)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.Sats)}>
                        <Sats
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.PersonligOppmøte)}
                            nesteUrl={
                                behandling.status == Behandlingsstatus.VILKÅRSVURDERT_AVSLAG
                                    ? vedtakUrl
                                    : vilkårUrl(Vilkårtype.Beregning)
                            }
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.Beregning)}>
                        <Beregning
                            behandling={behandling}
                            forrigeUrl={vilkårUrl(Vilkårtype.Sats)}
                            nesteUrl={vedtakUrl}
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
