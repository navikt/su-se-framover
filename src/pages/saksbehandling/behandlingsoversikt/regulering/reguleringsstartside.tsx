import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, GuidePanel } from '@navikt/ds-react';
import React from 'react';

import { testRegulering } from '~api/reguleringApi';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';

import messages from './regulering-nb';
import styles from './regulering.module.less';

interface Props {
    setReguleringer: (s: string) => void;
}

const Reguleringsstartside = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const [regulerStatus, reguler] = useApiCall(testRegulering);

    return (
        <div className={styles.container}>
            <GuidePanel className={styles.guidePanel}>
                <p>
                    {formatMessage('title', {
                        grunnbeløp: 'xxxxx',
                        dato: '01.05.22',
                    })}
                </p>
                <br />

                <p>{formatMessage('beskrivelse')}</p>
            </GuidePanel>

            <Button
                className={styles.startRegulering}
                onClick={() => reguler({}, () => props.setReguleringer('nyregulering'))}
                loading={RemoteData.isPending(regulerStatus)}
            >
                {formatMessage('startRegulering')}
            </Button>
        </div>
    );
};

export default Reguleringsstartside;
