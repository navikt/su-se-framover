import { Element } from 'nav-frontend-typografi';
import React from 'react';
import { Link } from 'react-router-dom';

import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { vilkårTittelFormatted, mapToVilkårsinformasjon, Vilkårsinformasjon } from '~features/saksoversikt/utils';
import * as Routes from '~lib/routes';
import { Behandling } from '~types/Behandling';
import { Vilkårtype } from '~types/Vilkårsvurdering';

import styles from './framdriftsindikator.module.less';

const Framdriftsindikator = (props: { sakId: string; behandling: Behandling; vilkår: Vilkårtype }) => {
    const { behandlingsinformasjon } = props.behandling;
    const vilkårrekkefølge = mapToVilkårsinformasjon(behandlingsinformasjon);

    return (
        <ol className={styles.framdriftsindikator}>
            {vilkårrekkefølge.map((v) => (
                <Vilkår
                    sakId={props.sakId}
                    behandlingId={props.behandling.id}
                    vilkår={v}
                    key={v.vilkårtype}
                    aktivtVilkår={props.vilkår}
                />
            ))}
        </ol>
    );
};

const Vilkår = (props: {
    sakId: string;
    behandlingId: string;
    vilkår: Vilkårsinformasjon;
    aktivtVilkår: Vilkårtype;
}) => {
    if (props.vilkår.erStartet) {
        return (
            <ClickableVilkår
                sakId={props.sakId}
                behandlingId={props.behandlingId}
                vilkår={props.vilkår}
                aktivtVilkår={props.aktivtVilkår}
            />
        );
    }

    return <VilkårInfo vilkår={props.vilkår} aktivtVilkår={props.aktivtVilkår} />;
};

const ClickableVilkår = (props: {
    sakId: string;
    behandlingId: string;
    vilkår: Vilkårsinformasjon;
    aktivtVilkår: Vilkårtype;
}) => {
    return (
        <Link
            to={Routes.saksbehandlingVilkårsvurdering.createURL({
                sakId: props.sakId,
                behandlingId: props.behandlingId,
                vilkar: props.vilkår.vilkårtype,
            })}
            className={styles.link}
        >
            <VilkårInfo vilkår={props.vilkår} aktivtVilkår={props.aktivtVilkår} />
        </Link>
    );
};

const VilkårInfo = (props: { vilkår: Vilkårsinformasjon; aktivtVilkår: Vilkårtype }) => {
    return (
        <div className={styles.vilkårInfoContainer}>
            <div className={styles.iconAndLineContainer}>
                <VilkårvurderingStatusIcon status={props.vilkår.status} />
            </div>
            {props.vilkår.vilkårtype === props.aktivtVilkår ? (
                <Element>{vilkårTittelFormatted(props.vilkår.vilkårtype)}</Element>
            ) : (
                <p>{vilkårTittelFormatted(props.vilkår.vilkårtype)}</p>
            )}
        </div>
    );
};

export default Framdriftsindikator;
