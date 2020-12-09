import React from 'react';

import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Sak } from '~types/Sak';

import VisBeregning from './beregning/VisBeregning';
import styles from './beregningOgSimulering.module.less';
import { VisSimulering } from './simulering/simulering';

const VisBeregningOgSimulering = (props: { sak: Sak; behandling: Behandling }) => (
    <div>
        {props.behandling.beregning && (
            <div className={styles.beregningOgSimuleringContainer}>
                <VisBeregning
                    beregning={props.behandling.beregning}
                    forventetinntekt={props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt ?? 0}
                />
                {props.behandling.status !== Behandlingsstatus.BEREGNET_AVSLAG && (
                    <div>
                        <VisSimulering sak={props.sak} behandling={props.behandling} />
                    </div>
                )}
            </div>
        )}
    </div>
);

export default VisBeregningOgSimulering;
