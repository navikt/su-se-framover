import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Person } from '~api/personApi';
import { erVilkårsvurderingerVurdertAvslag } from '~features/behandling/behandlingUtils';
import { createVilkårUrl } from '~features/saksoversikt/utils';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';
import { Vilkårtype } from '~types/Vilkårsvurdering';

import Beregning from '../beregningOgSimulering/beregning/Beregning';
import FastOppholdINorge from '../fast-opphold-i-norge/FastOppholdINorge';
import Flyktning from '../flyktning/Flyktning';
import Formue from '../formue/Formue';
import SaksbehandlingFramdriftsindikator from '../framdriftsindikator/SaksbehandlingFramdriftsindikator';
import Institusjonsopphold from '../institusjonsopphold/Institusjonsopphold';
import LovligOppholdINorge from '../lovlig-opphold-i-norge/LovligOppholdINorge';
import OppholdIUtlandet from '../opphold-i-utlandet/OppholdIUtlandet';
import PersonligOppmøte from '../personlig-oppmøte/PersonligOppmøte';
import Sats from '../sats/Sats';
import Uførhet from '../uførhet/Uførhet';
import Virkningstidspunkt from '../virkningstidspunkt/Virkningstidspunkt';

import styles from './vilkår.module.less';

const Vilkår = (props: { sak: Sak; søker: Person }) => {
    const { vilkar = Vilkårtype.Virkningstidspunkt, ...urlParams } =
        Routes.useRouteParams<typeof Routes.saksbehandlingVilkårsvurdering>();
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
            <SaksbehandlingFramdriftsindikator sakId={props.sak.id} behandling={behandling} vilkår={vilkar} />
            <div className={styles.content}>
                <Switch>
                    <Route path={vilkårUrl(Vilkårtype.Virkningstidspunkt)}>
                        <Virkningstidspunkt
                            behandling={behandling}
                            søker={props.søker}
                            forrigeUrl={saksoversiktUrl}
                            nesteUrl={vilkårUrl(Vilkårtype.Uførhet)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.Uførhet)}>
                        <Uførhet
                            behandling={behandling}
                            søker={props.søker}
                            forrigeUrl={vilkårUrl(Vilkårtype.Virkningstidspunkt)}
                            nesteUrl={vilkårUrl(Vilkårtype.Flyktning)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.Flyktning)}>
                        <Flyktning
                            behandling={behandling}
                            søker={props.søker}
                            forrigeUrl={vilkårUrl(Vilkårtype.Uførhet)}
                            nesteUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.LovligOpphold)}>
                        <LovligOppholdINorge
                            behandling={behandling}
                            søker={props.søker}
                            forrigeUrl={vilkårUrl(Vilkårtype.Flyktning)}
                            nesteUrl={vilkårUrl(Vilkårtype.FastOppholdINorge)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.FastOppholdINorge)}>
                        <FastOppholdINorge
                            behandling={behandling}
                            søker={props.søker}
                            forrigeUrl={vilkårUrl(Vilkårtype.LovligOpphold)}
                            nesteUrl={vilkårUrl(Vilkårtype.Institusjonsopphold)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.Institusjonsopphold)}>
                        <Institusjonsopphold
                            behandling={behandling}
                            søker={props.søker}
                            forrigeUrl={vilkårUrl(Vilkårtype.FastOppholdINorge)}
                            nesteUrl={vilkårUrl(Vilkårtype.OppholdIUtlandet)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.OppholdIUtlandet)}>
                        <OppholdIUtlandet
                            behandling={behandling}
                            søker={props.søker}
                            forrigeUrl={vilkårUrl(Vilkårtype.Institusjonsopphold)}
                            nesteUrl={vilkårUrl(Vilkårtype.Formue)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.Formue)}>
                        <Formue
                            behandling={behandling}
                            søker={props.søker}
                            forrigeUrl={vilkårUrl(Vilkårtype.OppholdIUtlandet)}
                            nesteUrl={vilkårUrl(Vilkårtype.PersonligOppmøte)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.PersonligOppmøte)}>
                        <PersonligOppmøte
                            behandling={behandling}
                            søker={props.søker}
                            forrigeUrl={vilkårUrl(Vilkårtype.Formue)}
                            nesteUrl={vilkårUrl(Vilkårtype.Sats)}
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.Sats)}>
                        <Sats
                            behandling={behandling}
                            søker={props.søker}
                            forrigeUrl={vilkårUrl(Vilkårtype.PersonligOppmøte)}
                            nesteUrl={
                                erVilkårsvurderingerVurdertAvslag(behandling)
                                    ? vedtakUrl
                                    : vilkårUrl(Vilkårtype.Beregning)
                            }
                            sakId={urlParams.sakId}
                        />
                    </Route>
                    <Route path={vilkårUrl(Vilkårtype.Beregning)}>
                        <Beregning
                            behandling={behandling}
                            søker={props.søker}
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
