import React from 'react';

import { erBeregnetAvslag } from '~features/behandling/behandlingUtils';
import { Behandling } from '~types/Behandling';
import { Sak } from '~types/Sak';

import VisBeregning from './beregning/VisBeregning';
import styles from './beregningOgSimulering.module.less';
import { VisSimulering } from './simulering/simulering';

const VisBeregningOgSimulering = (props: { sak: Sak; behandling: Behandling }) =>
    props.behandling.beregning ? (
        <div className={styles.beregningOgSimuleringContainer}>
            <VisBeregning beregning={props.behandling.beregning} />
            {!erBeregnetAvslag(props.behandling) && <VisSimulering sak={props.sak} behandling={props.behandling} />}
        </div>
    ) : null;

export default VisBeregningOgSimulering;
