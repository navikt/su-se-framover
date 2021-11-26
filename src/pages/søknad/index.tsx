import { Heading } from '@navikt/ds-react';
import * as React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import { useI18n } from '~lib/i18n';
import * as routes from '~lib/routes';
import { StartUtfylling } from '~pages/søknad/steg/start-utfylling/StartUtfylling';

import styles from './index.module.less';
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
                    <Route exact={true} path={routes.soknadsutfylling.path}>
                        <StartUtfylling />
                    </Route>
                    <Switch>
                        <Route exact={true} path={routes.soknad.path}>
                            <SøknadInfoWrapper>
                                <Infoside
                                    nesteUrl={routes.soknadPersonSøk.createURL({
                                        papirsøknad: isPapirsøknad,
                                    })}
                                />
                            </SøknadInfoWrapper>
                        </Route>
                        <Route exact={true} path={routes.soknadPersonSøk.path}>
                            <SøknadInfoWrapper>
                                <Inngang
                                    nesteUrl={routes.soknadsutfylling.createURL({
                                        step: Søknadsteg.Uførevedtak,
                                        papirsøknad: isPapirsøknad,
                                    })}
                                />
                            </SøknadInfoWrapper>
                        </Route>
                        <Route exact={true} path={routes.søkandskvittering.path}>
                            <SøknadInfoWrapper>
                                <Kvittering />
                            </SøknadInfoWrapper>
                        </Route>
                    </Switch>
                </Switch>
            </div>
        </div>
    );
};

export default index;
