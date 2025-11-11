import { Heading } from '@navikt/ds-react';
import { lazy } from 'react';
import { Route, Routes, useOutletContext } from 'react-router-dom';

import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import styles from './StansStyles.module.less';
import messages from './stans-nb';

const OpprettStansPage = lazy(() => import('~src/pages/saksbehandling/stans/OpprettStansPage'));
const OppdaterStans = lazy(() => import('~src/pages/saksbehandling/stans/OppdaterStans'));
const StansOppsummering = lazy(() => import('~src/pages/saksbehandling/stans/stansOppsummering'));

const Stans = () => {
    const { formatMessage } = useI18n({ messages });
    const context = useOutletContext<SaksoversiktContext>();

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('stans.tittel')}
            </Heading>
            <div className={styles.mainContent}>
                <Routes>
                    <Route path={routes.stansOpprett.path} element={<OpprettStansPage sakId={context.sak.id} />} />
                    <Route path={routes.oppdaterStansRoute.path} element={<OppdaterStans />} />
                    <Route path={routes.stansOppsummeringRoute.path} element={<StansOppsummering />} />
                </Routes>
            </div>
        </div>
    );
};

export default Stans;
