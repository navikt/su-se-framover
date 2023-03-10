import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Behandlingssammendrag } from '~src/types/Behandlingssammendrag';

import * as styles from './antallBehandlinger.module.less';

const messages = {
    behandlinger: 'behandlinger',
};

const AntallBehandlinger = (args: { behandlingssammendrag: Behandlingssammendrag[] }) => {
    const { formatMessage } = useI18n({ messages });
    return args.behandlingssammendrag.length > 0 ? (
        <div className={styles.antallBehandlingerContainer}>
            <Label>{args.behandlingssammendrag.length}</Label> <BodyShort>{formatMessage('behandlinger')}</BodyShort>
        </div>
    ) : null;
};

export default AntallBehandlinger;
