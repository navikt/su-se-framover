import React from 'react';

import { Behandling, Vilkårtype } from '~api/behandlingApi';
import * as Routes from '~lib/routes';

import { SaksbehandlingMenyvalg } from '../types';

import Framdriftsindikator from './Framdriftsindikator';
import styles from './v2.module.less';
import { Vurdering } from './Vurdering';

const Uførhet = (_props: { behandling: Behandling }) => {
    return (
        <Vurdering tittel="Uførhet">{{ left: <div>heisann venstre</div>, right: <div>hoppsann høyre</div> }}</Vurdering>
    );
};

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

    return (
        <div className={styles.container}>
            <div className={styles.framdriftsindikator}>
                <Framdriftsindikator behandling={props.behandling} vilkår={vilkar} />
            </div>
            <div className={styles.content}>
                {vilkar === Vilkårtype.Uførhet ? <Uførhet behandling={props.behandling} /> : '404'}
            </div>
        </div>
    );
};

export default Vilkår;
