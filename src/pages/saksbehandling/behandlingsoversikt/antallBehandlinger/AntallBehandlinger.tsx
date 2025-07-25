import { BodyShort, Label } from '@navikt/ds-react';

import { useI18n } from '~src/lib/i18n';
import { BehandlingssammendragMedId } from '~src/types/Behandlingssammendrag';

import styles from './antallBehandlinger.module.less';

const messages = {
    behandlinger: 'behandlinger',
};

const AntallBehandlinger = (args: { behandlingssammendrag: BehandlingssammendragMedId[] }) => {
    const { formatMessage } = useI18n({ messages });
    return args.behandlingssammendrag.length > 0 ? (
        <div className={styles.antallBehandlingerContainer}>
            <Label>{args.behandlingssammendrag.length}</Label> <BodyShort>{formatMessage('behandlinger')}</BodyShort>
        </div>
    ) : null;
};

export default AntallBehandlinger;
