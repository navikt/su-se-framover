import { Heading } from '@navikt/ds-react';
import * as React from 'react';
import { Switch, useHistory } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';

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
    const history = useHistory();
    const isPapirsøknad = history.location.search.includes('papirsoknad');
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.container}>
            <div className={styles.infostripe}>
                <Heading level="2" size="small">
                    {formatMessage('infolinje')}
                </Heading>
            </div>
            <div className={styles.contentContainer}>
                <Switch>
                    <CompatRoute exact={true} path={routes.soknadsutfylling.path}>
                        <StartUtfylling />
                    </CompatRoute>
                    <Switch>
                        <CompatRoute exact={true} path={routes.soknad.path}>
                            <SøknadInfoWrapper>
                                <Infoside
                                    nesteUrl={routes.soknadPersonSøk.createURL({
                                        papirsøknad: isPapirsøknad,
                                    })}
                                />
                            </SøknadInfoWrapper>
                        </CompatRoute>
                        <CompatRoute exact={true} path={routes.soknadPersonSøk.path}>
                            <SøknadInfoWrapper>
                                <Inngang
                                    nesteUrl={routes.soknadsutfylling.createURL({
                                        step: Søknadsteg.Uførevedtak,
                                        papirsøknad: isPapirsøknad,
                                    })}
                                />
                            </SøknadInfoWrapper>
                        </CompatRoute>
                        <CompatRoute exact={true} path={routes.søkandskvittering.path}>
                            <SøknadInfoWrapper>
                                <Kvittering />
                            </SøknadInfoWrapper>
                        </CompatRoute>
                    </Switch>
                </Switch>
            </div>
        </div>
    );
};

export default index;
