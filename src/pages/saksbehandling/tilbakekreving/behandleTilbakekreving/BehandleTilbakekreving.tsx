import React from 'react';

import * as routes from '~src/lib/routes';

import { TilbakekrevingSteg } from '../../types';

import styles from './BehandleTilbakekreving.module.less';
import TilbakekrevingStegIndikator from './TilbakekrevingStegIndikator';
import VurderTilbakekreving from './vurderTilbakekreving/VurderTilbakekreving';

const BehandleTilbakekreving = (props: { sakId: string }) => {
    const { steg } = routes.useRouteParams<typeof routes.tilbakekrevingValgtBehandling>();

    return (
        <div className={styles.pageContainer}>
            <TilbakekrevingStegIndikator
                sakId={props.sakId}
                behandlingId={''}
                aktivSteg={TilbakekrevingSteg.Vurdering}
            />
            <div className={styles.contentContainer}>
                {steg === TilbakekrevingSteg.Vurdering && <VurderTilbakekreving />}
            </div>
        </div>
    );
};

export default BehandleTilbakekreving;
