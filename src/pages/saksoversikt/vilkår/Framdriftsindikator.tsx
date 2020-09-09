import React from 'react';

import { Behandling, VilkårVurderingStatus, Vilkårtype } from '~api/behandlingApi';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { vilkårTittelFormatted } from '~features/saksoversikt/utils';
import {
    Behandlingsinformasjon,
    UførhetStatus,
    FlyktningStatus,
    LovligOppholdStatus,
    FastOppholdINorgeStatus,
    FormueStatus,
    PersonligOppmøteStatus,
} from '~types/Behandlingsinformasjon';

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

type Vilkårsinformasjon = {
    steg: keyof Behandlingsinformasjon;
    status: boolean;
    vilkårtype: Vilkårtype;
};

const mapToVilkårsinformasjon = (behandlingsinformasjon: Behandlingsinformasjon): Vilkårsinformasjon[] => {
    const { uførhet, flyktning, lovligOpphold, fastOppholdINorge, formue, personligOppmøte } = behandlingsinformasjon;

    return [
        {
            steg: 'uførhet',
            status: uførhet?.status === UførhetStatus.VilkårOppfylt,
            vilkårtype: Vilkårtype.Uførhet,
        },
        {
            steg: 'flyktning',
            status: flyktning?.status === FlyktningStatus.VilkårOppfylt,
            vilkårtype: Vilkårtype.Flyktning,
        },
        {
            steg: 'lovligOpphold',
            status: lovligOpphold?.status === LovligOppholdStatus.VilkårOppfylt,
            vilkårtype: Vilkårtype.LovligOpphold,
        },
        {
            steg: 'fastOppholdINorge',
            status: fastOppholdINorge?.status === FastOppholdINorgeStatus.VilkårOppfylt,
            vilkårtype: Vilkårtype.FastOppholdINorge,
        },
        {
            steg: 'formue',
            status: formue?.status === FormueStatus.Ok,
            vilkårtype: Vilkårtype.Formue,
        },
        {
            steg: 'personligOppmøte',
            status: personligOppmøte?.status !== PersonligOppmøteStatus.IkkeMøttOpp,
            vilkårtype: Vilkårtype.PersonligOppmøte,
        },
    ];
};

const Framdriftsindikator = (props: { behandling: Behandling; vilkår: keyof Behandlingsinformasjon }) => {
    const { behandlingsinformasjon } = props.behandling;
    const vilkårrekkefølge = mapToVilkårsinformasjon(behandlingsinformasjon);

    return (
        <ol className={styles.container}>
            {vilkårrekkefølge
                .filter((v) => v.status || props.vilkår === v.steg)
                .map((v) => {
                    const vilkårIkkeVurdert = behandlingsinformasjon[v.steg] === null;

                    return (
                        <Item
                            vilkar={v.vilkårtype}
                            status={
                                vilkårIkkeVurdert
                                    ? VilkårVurderingStatus.IkkeVurdert
                                    : v.status
                                    ? VilkårVurderingStatus.Ok
                                    : VilkårVurderingStatus.IkkeOk
                            }
                            key={v.steg}
                        />
                    );
                })}
        </ol>
    );
};

export default Framdriftsindikator;
