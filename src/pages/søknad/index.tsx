import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { FeatureToggle } from '~src/api/featureToggleApi';
import { useFeatureToggle } from '~src/lib/featureToggles';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { getSøknadstematekst } from '~src/pages/søknad/utils';
import { Sakstype } from '~src/types/Søknad';

import * as styles from './index.module.less';
import messages from './nb';

export interface SøknadContext {
    sakstype: Sakstype;
    isPapirsøknad: boolean;
}

const index = () => {
    const { formatMessage } = useI18n({ messages });
    const location = useLocation();
    const isPapirsøknad = location.search.includes('papirsoknad');
    const temaIUrl = Routes.useRouteParams<typeof Routes.soknadtema>().soknadstema;
    const sakstype = useFeatureToggle(FeatureToggle.Alder) ? Routes.sakstypeFraTemaIUrl(temaIUrl) : Sakstype.Uføre;

    return (
        <div className={styles.container}>
            <div
                className={classNames(styles.infostripe, {
                    [styles.ufore]: sakstype === Sakstype.Uføre,
                    [styles.alder]: sakstype === Sakstype.Alder,
                })}
            >
                {sakstype && (
                    <Heading level="2" size="small">
                        {getSøknadstematekst(sakstype, {
                            [Sakstype.Uføre]: formatMessage('infolinjeUføre'),
                            [Sakstype.Alder]: formatMessage('infolinjeAlder'),
                        })}
                    </Heading>
                )}
            </div>
            <div className={styles.contentContainer}>
                <div className={styles.content}>
                    <div className={styles.infoContainer}>
                        <Outlet context={{ sakstype, isPapirsøknad }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default index;
