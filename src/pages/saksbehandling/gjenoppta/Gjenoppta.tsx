import { Heading } from '@navikt/ds-react';
import { lazy } from 'react';
import { Route, Routes, useOutletContext } from 'react-router-dom';

import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import styles from './Gjenoppta.module.less';
import messages from './gjenoppta-nb';

const OpprettGjenoppta = lazy(() => import('~src/pages/saksbehandling/gjenoppta/OpprettGjenoppta'));
const OppdaterGjenoppta = lazy(() => import('~src/pages/saksbehandling/gjenoppta/OppdaterGjenoppta'));
const GjenopptaOppsummering = lazy(() => import('~src/pages/saksbehandling/gjenoppta/GjenopptaOppsummering'));

const Gjenoppta = () => {
    const { formatMessage } = useI18n({ messages });
    const context = useOutletContext<SaksoversiktContext>();

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('gjenoppta.tittel')}
            </Heading>
            <div className={styles.mainContent}>
                <Routes>
                    <Route
                        path={routes.opprettGjenopptaRoute.path}
                        element={<OpprettGjenoppta sakId={context.sak.id} />}
                    />
                    <Route path={routes.oppdaterGjenopptaRoute.path} element={<OppdaterGjenoppta />} />
                    <Route path={routes.gjenopptaOppsummeringRoute.path} element={<GjenopptaOppsummering />} />
                </Routes>
            </div>
        </div>
    );
};

export default Gjenoppta;
