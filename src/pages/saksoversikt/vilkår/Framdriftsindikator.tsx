import React from 'react';

import { Behandling, VilkårVurderingStatus, Vilkårtype } from '~api/behandlingApi';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { vilkårTittelFormatted, mapToVilkårsinformasjon } from '~features/saksoversikt/utils';

import styles from './framdriftsindikator.module.less';

const Item = (props: { vilkar: Vilkårtype; status: VilkårVurderingStatus }) => {
    return (
        <div className={styles.item}>
            <div className={styles.iconAndLineContainer}>
                <VilkårvurderingStatusIcon status={props.status} />
                <span className={styles.line} />
            </div>
            <span>{vilkårTittelFormatted(props.vilkar)}</span>
        </div>
    );
};

const Framdriftsindikator = (props: { behandling: Behandling; vilkår: Vilkårtype }) => {
    const { behandlingsinformasjon } = props.behandling;
    const vilkårrekkefølge = mapToVilkårsinformasjon(behandlingsinformasjon);

    console.log(props.vilkår.toLowerCase());
    return (
        <ol className={styles.container}>
            {vilkårrekkefølge
                .filter((v) => v.status !== VilkårVurderingStatus.IkkeVurdert || props.vilkår === v.vilkårtype)
                .map((v) => (
                    <Item vilkar={v.vilkårtype} status={v.status} key={v.vilkårtype} />
                ))}
        </ol>
    );
};

export default Framdriftsindikator;
