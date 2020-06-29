import React from 'react';

import Vilkårsvurdering from '../vilkårsvurdering/Vilkårsvurdering';
import WarningIcon from '../icons/WarningIcon';

import * as RemoteData from '@devexperts/remote-data-ts';
import { useAppSelector } from '~redux/Store';

import styles from './vilkår.module.less';
import * as behandlingApi from '~api/behandlingApi';
import { pipe } from '~lib/fp';
import AlertStripe from 'nav-frontend-alertstriper';

const VilkårInnhold = (props: { behandling: behandlingApi.Behandling }) => {
    return (
        <div className={styles.container}>
            <Vilkårsvurdering
                title="Uførhet"
                icon={<WarningIcon />}
                legend="Uførhet"
                status={props.behandling.vilkårsvurderinger[0].status}
                begrunnelse={props.behandling.vilkårsvurderinger[0].begrunnelse}
                onSaveClick={console.log}
            />
        </div>
    );
};

const Vilkår = () => {
    const behandling = useAppSelector((s) => s.sak.behandling);
    return (
        <div className={styles.container}>
            {pipe(
                behandling,
                RemoteData.fold(
                    () => <></>,
                    () => <></>,
                    (error) => <AlertStripe type="feil">{error.message}</AlertStripe>,
                    (data) => <VilkårInnhold behandling={data} />
                )
            )}
        </div>
    );
};
export default Vilkår;
