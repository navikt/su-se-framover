import React from 'react';
import { Route, Routes, useOutletContext } from 'react-router-dom';

import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as routes from '~src/lib/routes';

import BehandleTilbakekreving from './behandleTilbakekreving/BehandleTilbakekreving';
import OpprettTilbakekreving from './opprettTilbakekreving/OpprettTilbakekreving';

const Tilbakekreving = () => {
    const { sak } = useOutletContext<SaksoversiktContext>();

    return (
        <Routes>
            <Route path={routes.tilbakekrevValgtSak.path} element={<OpprettTilbakekreving />} />
            <Route
                path={routes.tilbakekrevingValgtBehandling.path}
                element={<BehandleTilbakekreving sakId={sak.id} />}
            />
        </Routes>
    );
};

export default Tilbakekreving;
