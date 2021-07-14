import { Element } from 'nav-frontend-typografi';
import React from 'react';

import { useI18n } from '~lib/hooks';
import { Behandling } from '~types/Behandling';
import { erBeregnetAvslag } from '~utilsLOL/behandling/behandlingUtils';

import messages from './beregning/beregning-nb';
import VisBeregning from './beregning/VisBeregning';
import styles from './beregningOgSimulering.module.less';
import { VisSimulering } from './simulering/simulering';

const VisBeregningOgSimulering = (props: { behandling: Behandling }) => {
    const { intl } = useI18n({ messages });
    return props.behandling.beregning ? (
        <div className={styles.beregningOgSimuleringContainer}>
            <VisBeregning beregning={props.behandling.beregning} />
            {!erBeregnetAvslag(props.behandling) && <VisSimulering behandling={props.behandling} />}
            {props.behandling.beregning.begrunnelse && (
                <div>
                    <Element>{intl.formatMessage({ id: 'display.visBeregning.begrunnelse' })}</Element>
                    <p>{props.behandling.beregning.begrunnelse}</p>
                </div>
            )}
        </div>
    ) : null;
};

export default VisBeregningOgSimulering;
