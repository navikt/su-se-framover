import { BodyShort, Button, Heading, Modal } from '@navikt/ds-react';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useI18n } from '~src/lib/i18n';
import styles from './nullstillRevurderingVarsel.module.less';
import messages from './nullstillRevurderingVarsel-nb';

const NullstillRevurderingVarsel = (props: { isOpen: boolean; onClose: () => void; førsteStegUrl: string }) => {
    const { formatMessage } = useI18n({ messages: { ...messages } });
    return (
        <Modal open={props.isOpen} onClose={props.onClose} aria-label={formatMessage('tittel')}>
            <div className={styles.modalContainer}>
                <Heading level="2" size="medium" className={styles.modalTittel}>
                    {formatMessage('tittel')}
                </Heading>
                <div>
                    <BodyShort>{formatMessage('info.p1')}</BodyShort>
                    <BodyShort>{formatMessage('info.p2')}</BodyShort>
                </div>
                <div className={styles.modalKnappContainer}>
                    <Button variant="tertiary" type="button" onClick={props.onClose}>
                        {formatMessage('knapp.avbryt')}
                    </Button>
                    <LinkAsButton variant="danger" href={props.førsteStegUrl}>
                        {formatMessage('knapp.gåTilbake')}
                    </LinkAsButton>
                </div>
            </div>
        </Modal>
    );
};

export default NullstillRevurderingVarsel;
