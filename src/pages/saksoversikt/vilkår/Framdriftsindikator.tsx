import React from 'react';

import { Behandling, Vilkårtype, VilkårVurderingStatus } from '~api/behandlingApi';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { vilkårTittelFormatted } from '~features/saksoversikt/utils';

import styles from './framdriftsindikator.module.less';

const Item = (props: { vilkar: Vilkårtype; status: VilkårVurderingStatus }) => (
    <div className={styles.item}>
        <div className={styles.iconAndLineContainer}>
            <VilkårvurderingStatusIcon status={props.status} />
            <span className={styles.line} />
        </div>
        <span>{vilkårTittelFormatted(props.vilkar)}</span>
    </div>
);

const vilkårrekkefølge = [
    Vilkårtype.Uførhet,
    Vilkårtype.Flyktning,
    Vilkårtype.Oppholdstillatelse,
    Vilkårtype.PersonligOppmøte,
    Vilkårtype.Formue,
    Vilkårtype.BorOgOppholderSegINorge,
];

const Framdriftsindikator = (props: { behandling: Behandling; vilkår: Vilkårtype }) => {
    return (
        <ol className={styles.container}>
            {vilkårrekkefølge
                .filter(
                    (v) =>
                        props.behandling.vilkårsvurderinger[v].status !== VilkårVurderingStatus.IkkeVurdert ||
                        v === props.vilkår
                )
                .map((v) => (
                    <Item vilkar={v} status={props.behandling.vilkårsvurderinger[v].status} key={v} />
                ))}
        </ol>
    );
};

export default Framdriftsindikator;
