import React from 'react';

import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { vilkårTittelFormatted, mapToVilkårsinformasjon } from '~features/saksoversikt/utils';
import { Behandling } from '~types/Behandling';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

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
