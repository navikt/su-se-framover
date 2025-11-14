import { Route, Routes, useOutletContext } from 'react-router-dom';

import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as routes from '~src/lib/routes';

import BehandleTilbakekreving from './behandleTilbakekreving/BehandleTilbakekreving';
import OpprettTilbakekreving from './opprettTilbakekreving/OpprettTilbakekreving';

const Tilbakekreving = () => {
    const { sak } = useOutletContext<SaksoversiktContext>();

    return (
        <Routes>
            <Route
                path={routes.tilbakekrevValgtSak.path}
                element={
                    <OpprettTilbakekreving
                        sakId={sak.id}
                        sakVersjon={sak.versjon}
                        uteståendeKravgrunnlag={sak.uteståendeKravgrunnlag}
                        alleVedtak={sak.vedtak}
                    />
                }
            />
            <Route
                path={routes.tilbakekrevingValgtBehandling.path}
                element={
                    <BehandleTilbakekreving
                        sakId={sak.id}
                        saksversjon={sak.versjon}
                        tilbakekrevinger={sak.tilbakekrevinger}
                    />
                }
            />
        </Routes>
    );
};

export default Tilbakekreving;
