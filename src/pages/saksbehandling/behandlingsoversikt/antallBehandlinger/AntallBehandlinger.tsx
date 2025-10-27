import { BodyShort, Label } from '@navikt/ds-react';

import { useI18n } from '~src/lib/i18n';
import { BehandlingssammendragMedId } from '~src/types/Behandlingssammendrag';

import styles from './antallBehandlinger.module.less';

const messages = {
    behandlinger: 'behandlinger',
};

const AntallBehandlinger = (props: {
    filtrerteBehandlinger: BehandlingssammendragMedId[];
    alleBehandligner: BehandlingssammendragMedId[];
}) => {
    const { formatMessage } = useI18n({ messages });
    return props.filtrerteBehandlinger.length > 0 ? (
        <div className={styles.antallBehandlingerContainer}>
            <Label>Viser {props.filtrerteBehandlinger.length}</Label>{' '}
            <BodyShort>{`${formatMessage('behandlinger')} av totalt ${props.alleBehandligner.length}`}</BodyShort>
        </div>
    ) : null;
};

export default AntallBehandlinger;
