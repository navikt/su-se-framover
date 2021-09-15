import { Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import React from 'react';

import { Utbetalingssimulering } from '~components/beregningOgSimulering/simulering/simulering';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';
import { erRevurderingSimulert } from '~utils/revurdering/revurderingUtils';

import styles from './stans.module.less';

interface Props {
    sak: Sak;
}
const StansOppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.stansOppsummeringRoute>();
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);

    if (revurdering && erRevurderingSimulert(revurdering)) {
        return (
            <div className={styles.stansOppsummering}>
                <Panel border className={styles.stansOppsummering}>
                    <Utbetalingssimulering simulering={revurdering.simulering} />
                </Panel>
                <div className={styles.iverksett}>
                    <Knapp> Iverksett </Knapp>
                </div>
            </div>
        );
    }

    return <div> NO REVURDERING =(</div>;
};

export default StansOppsummering;
