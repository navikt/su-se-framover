import React from 'react';

import Framdriftsindikator, { Linjestatus } from '~src/components/framdriftsindikator/Framdriftsindikator';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';

import { TilbakekrevingSteg } from '../../types';
import messages from '../Tilbakekreving-nb';

const TilbakekrevingStegIndikator = (props: { sakId: string; behandlingId: string; aktivSteg: TilbakekrevingSteg }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Framdriftsindikator
            elementer={[
                {
                    id: TilbakekrevingSteg.Vurdering,
                    erKlikkbar: false,
                    label: formatMessage(`stegIndikator.${TilbakekrevingSteg.Vurdering}`),
                    status: Linjestatus.Ingenting,
                    url: Routes.tilbakekrevingValgtBehandling.createURL({
                        sakId: props.sakId,
                        behandlingId: props.behandlingId,
                        steg: TilbakekrevingSteg.Vurdering,
                    }),
                },
            ]}
            aktivId={props.aktivSteg}
        />
    );
};

export default TilbakekrevingStegIndikator;
