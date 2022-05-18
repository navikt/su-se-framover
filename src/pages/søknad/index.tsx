import { Heading } from '@navikt/ds-react';
import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { ALDERSØKNAD_FEATURE_ENABLED } from '~src/lib/featureToggles';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { getSøknadstematekst } from '~src/pages/søknad/utils';
import { Søknadstema } from '~src/types/Søknad';

import * as styles from './index.module.less';
import messages from './nb';

export interface SøknadContext {
    soknadstema: Søknadstema;
    isPapirsøknad: boolean;
}

const index = () => {
    const { formatMessage } = useI18n({ messages });
    const location = useLocation();
    const isPapirsøknad = location.search.includes('papirsoknad');
    const soknadstema = ALDERSØKNAD_FEATURE_ENABLED
        ? Routes.useRouteParams<typeof Routes.soknadtema>().soknadstema
        : Søknadstema.Uføre;

    return (
        <div className={styles.container}>
            {soknadstema ? (
                <div className={styles.infostripe}>
                    <Heading level="2" size="small">
                        {getSøknadstematekst(soknadstema, {
                            [Søknadstema.Uføre]: formatMessage('infolinjeUføre'),
                            [Søknadstema.Alder]: formatMessage('infolinjeAlder'),
                        })}
                    </Heading>
                </div>
            ) : (
                <div className={styles.topspacer} />
            )}
            <div className={styles.contentContainer}>
                <div className={styles.content}>
                    <div className={styles.infoContainer}>
                        <Outlet context={{ soknadstema, isPapirsøknad }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default index;
