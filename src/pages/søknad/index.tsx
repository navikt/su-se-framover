import { Heading } from '@navikt/ds-react';
import * as React from 'react';
import { Outlet } from 'react-router-dom';

import { useI18n } from '~src/lib/i18n';

import * as styles from './index.module.less';
import messages from './nb';

const SøknadInfoWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={styles.content}>
        <div className={styles.infoContainer}>{children}</div>
    </div>
);

const index = () => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.container}>
            <div className={styles.infostripe}>
                <Heading level="2" size="small">
                    {formatMessage('infolinje')}
                </Heading>
            </div>
            <div className={styles.contentContainer}>
                <SøknadInfoWrapper>
                    <Outlet />
                </SøknadInfoWrapper>
            </div>
        </div>
    );
};

export default index;
