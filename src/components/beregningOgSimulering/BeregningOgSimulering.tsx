import { Label } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~lib/i18n';
import { Behandling } from '~types/Behandling';
import { erBeregnetAvslag } from '~utils/behandling/behandlingUtils';

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
            {!props.behandling.beregning.begrunnelse && (
                <div>
                    <Label size="small">{intl.formatMessage({ id: 'display.visBeregning.begrunnelse' })}</Label>
                    <p>{props.behandling.beregning.begrunnelse}</p>
                </div>
            )}
        </div>
    ) : null;
};

export default VisBeregningOgSimulering;
