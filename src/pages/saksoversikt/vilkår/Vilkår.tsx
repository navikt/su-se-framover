import React from 'react';
import { Undertittel } from 'nav-frontend-typografi';

import Vilkårsvurdering from '../vilkårsvurdering/Vilkårsvurdering';
import WarningIcon from '../icons/WarningIcon';
import styles from './vilkår.module.less';
import { Behandling, Vilkårtype } from '~api/behandlingApi';
import { Sak } from '~api/sakApi';
import { Søknad } from '~api/søknadApi';

const VilkårInnhold = (props: { behandling: Behandling; søknad: Søknad }) => {
    const { vilkårsvurderinger } = props.behandling;
    return (
        <div className={styles.container}>
            <Vilkårsvurdering
                title="Uførhet"
                paragraph="§ 12-4 - § 12-8"
                icon={<WarningIcon />}
                legend="Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-8 i folketrygdloven er oppfylt?"
                status={vilkårsvurderinger[Vilkårtype.Uførhet].status}
                begrunnelse={vilkårsvurderinger[Vilkårtype.Uførhet].begrunnelse}
                onSaveClick={console.log}
            >
                <div>
                    <Undertittel>Fra søknad</Undertittel>
                    <p>Har uførevedtak: {props.søknad.uførevedtak.harUførevedtak.toString()}</p>
                </div>
            </Vilkårsvurdering>
        </div>
    );
};

const Vilkår = (props: { sak: Sak; stønadsperiodeId: string; behandlingId: string }) => {
    const stønadsperiode = props.sak.stønadsperioder.find((sp) => sp.id.toString() === props.stønadsperiodeId);
    const behandling = stønadsperiode?.behandlinger.find((b) => b.id.toString() === props.behandlingId);
    const søknad = stønadsperiode?.søknad;

    return (
        <div className={styles.container}>
            {behandling && søknad ? (
                <VilkårInnhold behandling={behandling} søknad={søknad.json} />
            ) : (
                'Klarte ikke finne søknaden'
            )}
        </div>
    );
};
export default Vilkår;
