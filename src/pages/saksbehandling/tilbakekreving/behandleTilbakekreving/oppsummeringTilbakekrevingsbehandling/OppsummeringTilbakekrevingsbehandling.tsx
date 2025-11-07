import * as RemoteData from '@devexperts/remote-data-ts';
import { useNavigate } from 'react-router-dom';

import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import OppsummeringAvTilbakekrevingsbehandling from '~src/components/oppsummering/oppsummeringAvTilbakekrevingsbehandling/OppsummeringAvTilbakekrevingsbehandling';
import { sendTilbakekrevingTilAttestering } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { ManuellTilbakekrevingsbehandling, TilbakekrevingSteg } from '~src/types/ManuellTilbakekrevingsbehandling';

import messages from '../../Tilbakekreving-nb';

import styles from './OppsummeringTilbakekrevingsbehandling.module.less';

const OppsummeringTilbakekrevingsbehandling = (props: {
    sakId: string;
    saksversjon: number;
    tilbakekreving: ManuellTilbakekrevingsbehandling;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [sendTilAttesteringStatus, sendTilAttestering] = useAsyncActionCreator(sendTilbakekrevingTilAttestering);

    return (
        <div className={styles.pageContainer}>
            <OppsummeringAvTilbakekrevingsbehandling behandling={props.tilbakekreving} />
            <Navigasjonsknapper
                neste={{
                    loading: RemoteData.isPending(sendTilAttesteringStatus),
                    tekst: formatMessage('oppsummeringTilbakekreving.sendTilAttestering'),
                    onClick: () =>
                        sendTilAttestering(
                            {
                                sakId: props.sakId,
                                behandlingId: props.tilbakekreving.id,
                                versjon: props.saksversjon,
                            },
                            () => {
                                routes.navigateToSakIntroWithMessage(
                                    navigate,
                                    formatMessage('oppsummeringTilbakekreving.sendtTilAttestering'),
                                    props.sakId,
                                );
                            },
                        ),
                }}
                tilbake={{
                    url: routes.tilbakekrevingValgtBehandling.createURL({
                        sakId: props.sakId,
                        behandlingId: props.tilbakekreving.id,
                        steg: TilbakekrevingSteg.Vedtaksbrev,
                    }),
                }}
            />
        </div>
    );
};

export default OppsummeringTilbakekrevingsbehandling;
