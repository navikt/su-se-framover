import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~lib/i18n';
import { Restans } from '~types/Restans';

import styles from './antallBehandlinger.module.less';

const messages = {
    behandlinger: 'behandlinger',
};

const AntallBehandlinger = (args: { restanser: Restans[] }) => {
    const { formatMessage } = useI18n({ messages });
    return args.restanser.length > 0 ? (
        <div className={styles.antallBehandlingerContainer}>
            <Label>{args.restanser.length}</Label> <BodyShort>{formatMessage('behandlinger')}</BodyShort>
        </div>
    ) : null;
};

export default AntallBehandlinger;
