import { Heading } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';

import { TilbakekrevingSteg } from '../../types';
import messages from '../Tilbakekreving-nb';

import styles from './BehandleTilbakekreving.module.less';
import BrevForTilbakekreving from './brevForTilbakekreving/BrevForTilbakekreving';
import TilbakekrevingStegIndikator from './TilbakekrevingStegIndikator';
import VurderTilbakekreving from './vurderTilbakekreving/VurderTilbakekreving';

const BehandleTilbakekreving = (props: {
    sakId: string;
    saksversjon: number;
    tilbakekrevinger: ManuellTilbakekrevingsbehandling[];
}) => {
    const { formatMessage } = useI18n({ messages });
    const { behandlingId, steg } = routes.useRouteParams<typeof routes.tilbakekrevingValgtBehandling>();

    const behandling = props.tilbakekrevinger.find((t) => t.id === behandlingId);

    if (!behandling) {
        return (
            <div>
                Her skulle det visst være en behandling, men var ingenting. Er URLen i riktig format, men en
                eksisterende id?
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="large" className={styles.pageTittel}>
                {formatMessage('tilbakekreving.tittel')}
            </Heading>
            <div className={styles.contentContainerMedFramdriftsindikator}>
                <TilbakekrevingStegIndikator
                    sakId={props.sakId}
                    behandling={behandling}
                    aktivSteg={TilbakekrevingSteg.Vurdering}
                />
                {steg === TilbakekrevingSteg.Vurdering && (
                    <VurderTilbakekreving
                        sakId={props.sakId}
                        saksversjon={props.saksversjon}
                        tilbakekreving={behandling}
                    />
                )}
                {steg === TilbakekrevingSteg.Brev && (
                    <BrevForTilbakekreving
                        sakId={props.sakId}
                        saksversjon={props.saksversjon}
                        tilbakekreving={behandling}
                    />
                )}
            </div>
        </div>
    );
};

export default BehandleTilbakekreving;
