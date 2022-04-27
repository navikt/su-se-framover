import { Heading } from '@navikt/ds-react';
import * as React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { StartUtfylling } from '~src/pages/søknad/steg/start-utfylling/StartUtfylling';

import * as styles from './index.module.less';
import Kvittering from './kvittering/Kvittering';
import messages from './nb';
import Infoside from './steg/infoside/Infoside';
import Inngang from './steg/inngang/Inngang';
import { Søknadsteg } from './types';

const SøknadInfoWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={styles.content}>
        <div className={styles.infoContainer}>{children}</div>
    </div>
);

const index = () => {
    const location = useLocation();
    const isPapirsøknad = location.search.includes('papirsoknad');
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.container}>
            <div className={styles.infostripe}>
                <Heading level="2" size="small">
                    {formatMessage('infolinje')}
                </Heading>
            </div>
            <div className={styles.contentContainer}>
                <Routes>
                    <Route path={routes.soknadsutfylling.path} element={<StartUtfylling />} />
                    <Route
                        path={'/'}
                        element={
                            <SøknadInfoWrapper>
                                <Infoside
                                    nesteUrl={routes.soknadPersonSøk.createURL({
                                        papirsøknad: isPapirsøknad,
                                    })}
                                />
                            </SøknadInfoWrapper>
                        }
                    />
                    <Route
                        path={routes.soknadPersonSøk.path}
                        element={
                            <SøknadInfoWrapper>
                                <Inngang
                                    nesteUrl={routes.soknadsutfylling.createURL({
                                        step: Søknadsteg.Uførevedtak,
                                        papirsøknad: isPapirsøknad,
                                    })}
                                />
                            </SøknadInfoWrapper>
                        }
                    />
                    <Route
                        path={routes.søkandskvittering.path}
                        element={
                            <SøknadInfoWrapper>
                                <Kvittering />
                            </SøknadInfoWrapper>
                        }
                    />
                </Routes>
            </div>
        </div>
    );
};

export default index;
