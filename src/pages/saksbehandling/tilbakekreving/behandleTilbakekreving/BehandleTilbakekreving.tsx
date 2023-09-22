import React from 'react';

import * as routes from '~src/lib/routes';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';

import { TilbakekrevingSteg } from '../../types';

import styles from './BehandleTilbakekreving.module.less';
import TilbakekrevingStegIndikator from './TilbakekrevingStegIndikator';
import VurderTilbakekreving from './vurderTilbakekreving/VurderTilbakekreving';

const BehandleTilbakekreving = (props: { sakId: string; tilbakekrevinger: ManuellTilbakekrevingsbehandling[] }) => {
    const { behandlingId, steg } = routes.useRouteParams<typeof routes.tilbakekrevingValgtBehandling>();

    const behandling = props.tilbakekrevinger.find((t) => t.id === behandlingId);

    /*
    //TODO - uncomment når vi har backend på plass
    if (!behandling) {
        return (
            <div>
                Her skulle det visst være en behandling, men var ingenting. Er URLen i riktig format, men en
                eksisterende id?
            </div>
        );
    }
    */

    return (
        <div className={styles.pageContainer}>
            <TilbakekrevingStegIndikator
                sakId={props.sakId}
                behandlingId={behandling?.id ?? ''}
                aktivSteg={TilbakekrevingSteg.Vurdering}
            />
            <div className={styles.contentContainer}>
                {steg === TilbakekrevingSteg.Vurdering && (
                    <VurderTilbakekreving sakId={props.sakId} tilbakekreving={behandling} />
                )}
            </div>
        </div>
    );
};

export default BehandleTilbakekreving;
