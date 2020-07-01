import React from 'react';

import Vilkårsvurdering from '../vilkårsvurdering/Vilkårsvurdering';
import WarningIcon from '../icons/WarningIcon';

import * as RemoteData from '@devexperts/remote-data-ts';
import { useAppSelector } from '~redux/Store';

import styles from './vilkår.module.less';
import * as behandlingApi from '~api/behandlingApi';
import { pipe } from '~lib/fp';
import AlertStripe from 'nav-frontend-alertstriper';
import { Sak } from '~api/sakApi';
import { Undertittel } from 'nav-frontend-typografi';

const VilkårInnhold = (props: { behandling: behandlingApi.Behandling; sak: Sak }) => {
    return (
        <div className={styles.container}>
            <Vilkårsvurdering
                title="Uførhet"
                paragraph="§ 12-4 - § 12-8"
                icon={<WarningIcon />}
                legend="Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-8 i folketrygdloven er oppfylt?"
                status={props.behandling.vilkårsvurderinger[0].status}
                begrunnelse={props.behandling.vilkårsvurderinger[0].begrunnelse}
                onSaveClick={console.log}
            >
                <div>
                    <Undertittel>Fra søknad</Undertittel>
                    <p>
                        Har uførevedtak:{' '}
                        {props.sak.stønadsperioder[0].søknad.json.uførevedtak.harUførevedtak.toString()}
                    </p>
                </div>
            </Vilkårsvurdering>
        </div>
    );
};

const Vilkår = (props: { sak: Sak }) => {
    const behandling = useAppSelector((s) => s.sak.behandling);
    return (
        <div className={styles.container}>
            {pipe(
                behandling,
                RemoteData.fold(
                    () => <></>,
                    () => <></>,
                    (error) => <AlertStripe type="feil">{error.message}</AlertStripe>,
                    (data) => <VilkårInnhold behandling={data} sak={props.sak} />
                )
            )}
        </div>
    );
};
export default Vilkår;
