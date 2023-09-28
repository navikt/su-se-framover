import React from 'react';

import Framdriftsindikator, { Linjestatus } from '~src/components/framdriftsindikator/Framdriftsindikator';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';
import {
    erTilbakekrevingsVurdertMedBrevEllerSenere,
    erTilbakekrevingsVurdertUtenBrevEllerSenere,
} from '~src/utils/ManuellTilbakekrevingsbehandlingUtils';

import { TilbakekrevingSteg } from '../../types';
import messages from '../Tilbakekreving-nb';

const stegsInformasjon = (behandling: ManuellTilbakekrevingsbehandling, steg: TilbakekrevingSteg) => {
    switch (steg) {
        case TilbakekrevingSteg.Vurdering:
            return erTilbakekrevingsVurdertUtenBrevEllerSenere(behandling)
                ? { erKlikkbar: true, linjeStatus: Linjestatus.Ok }
                : { erKlikkbar: false, linjeStatus: Linjestatus.Ingenting };
        case TilbakekrevingSteg.Brev:
            return erTilbakekrevingsVurdertMedBrevEllerSenere(behandling)
                ? { erKlikkbar: true, linjeStatus: Linjestatus.Ok }
                : { erKlikkbar: false, linjeStatus: Linjestatus.Ingenting };
    }
};

const TilbakekrevingStegIndikator = (props: {
    sakId: string;
    behandling: ManuellTilbakekrevingsbehandling;
    aktivSteg: TilbakekrevingSteg;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Framdriftsindikator
            elementer={Object.values(TilbakekrevingSteg).map((steg) => {
                const stegInfo = stegsInformasjon(props.behandling, steg);
                return {
                    id: steg,
                    erKlikkbar: stegInfo.erKlikkbar,
                    label: formatMessage(`stegIndikator.${steg}`),
                    status: stegInfo.linjeStatus,
                    url: Routes.tilbakekrevingValgtBehandling.createURL({
                        sakId: props.sakId,
                        behandlingId: props.behandling.id,
                        steg: steg,
                    }),
                };
            })}
            aktivId={props.aktivSteg}
        />
    );
};

export default TilbakekrevingStegIndikator;
