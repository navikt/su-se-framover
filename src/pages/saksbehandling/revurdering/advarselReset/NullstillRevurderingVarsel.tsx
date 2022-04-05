import { Button, Modal, Heading, BodyShort } from '@navikt/ds-react';
import React from 'react';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { useI18n } from '~lib/i18n';

import messages from './nullstillRevurderingVarsel-nb';
import styles from './nullstillRevurderingVarsel.module.less';

const NullstillRevurderingVarsel = (props: { isOpen: boolean; onClose: () => void; tilbakeUrl: string }) => {
    const { formatMessage } = useI18n({ messages: { ...messages } });
    return (
        <Modal open={props.isOpen} onClose={props.onClose}>
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
                    <LinkAsButton variant="danger" href={props.tilbakeUrl}>
                        {formatMessage('knapp.gåTilbake')}
                    </LinkAsButton>
                </div>
            </div>
        </Modal>
    );
};

export default NullstillRevurderingVarsel;
