import React from 'react';

import { Behandling, Vilkårtype } from '~api/behandlingApi';
import * as Routes from '~lib/routes';

import { SaksbehandlingMenyvalg } from '../types';

import Flyktning from './Flyktning';
import Framdriftsindikator from './Framdriftsindikator';
import Uførhet from './Uførhet';
import styles from './v2.module.less';

const Vilkår = (props: { sakId: string; behandling: Behandling | undefined }) => {
    const { vilkar = Vilkårtype.Uførhet, ...urlParams } = Routes.useRouteParams<typeof Routes.saksoversikt>();

    if (
        !(
            props.behandling &&
            urlParams.sakId &&
            urlParams.behandlingId &&
            urlParams.meny === SaksbehandlingMenyvalg.Vilkår
        )
    ) {
        return <div>404</div>;
    }

    const createVilkårUrl = (v: Vilkårtype) =>
        Routes.saksoversikt.createURL({
            behandlingId: urlParams.behandlingId,
            sakId: urlParams.sakId,
            meny: SaksbehandlingMenyvalg.Vilkår,
            vilkar: v,
        });

    return (
        <div className={styles.container}>
            <div className={styles.framdriftsindikator}>
                <Framdriftsindikator behandling={props.behandling} vilkår={vilkar} />
            </div>
            <div className={styles.content}>
                {vilkar === Vilkårtype.Uførhet ? (
                    <Uførhet
                        behandling={props.behandling}
                        forrigeUrl={Routes.saksoversikt.createURL({
                            behandlingId: urlParams.behandlingId,
                            sakId: urlParams.sakId,
                        })}
                        nesteUrl={createVilkårUrl(Vilkårtype.Flyktning)}
                    />
                ) : vilkar === Vilkårtype.Flyktning ? (
                    <Flyktning
                        behandling={props.behandling}
                        forrigeUrl={createVilkårUrl(Vilkårtype.Uførhet)}
                        nesteUrl={createVilkårUrl(Vilkårtype.Flyktning)}
                    />
                ) : (
                    '404'
                )}
            </div>
        </div>
    );
};

export default Vilkår;
