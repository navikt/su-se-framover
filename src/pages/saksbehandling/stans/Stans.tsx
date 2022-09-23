import { Heading } from '@navikt/ds-react';
import React from 'react';
import { Route, Routes, useOutletContext } from 'react-router-dom';

import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { SaksoversiktContext } from '~src/utils/router/routerUtils';

import messages from './stans-nb';
import styles from './StansStyles.module.less';

const OpprettStansPage = React.lazy(() => import('~src/pages/saksbehandling/stans/OpprettStansPage'));
const OppdaterStans = React.lazy(() => import('~src/pages/saksbehandling/stans/OppdaterStans'));
const StansOppsummering = React.lazy(() => import('~src/pages/saksbehandling/stans/stansOppsummering'));

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
