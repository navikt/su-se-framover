import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import { Outlet, useLocation } from 'react-router-dom';

import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { getSøknadstematekst } from '~src/pages/søknad/utils';
import { Sakstype } from '~src/types/Sak';

import styles from './index.module.less';
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
    const sakstype = Routes.sakstypeFraTemaIUrl(temaIUrl);

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
                    <Outlet context={{ sakstype, isPapirsøknad }} />
                </div>
            </div>
        </div>
    );
};

export default index;
