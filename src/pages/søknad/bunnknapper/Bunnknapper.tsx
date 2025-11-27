import { Alert, BodyShort, Button, Modal } from '@navikt/ds-react';
import { useState } from 'react';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useI18n } from '~src/lib/i18n';
import styles from './bunnknapper.module.less';
import messages from './bunnknapper-nb';

const Bunnknapper = (props: {
    previous?: {
        label?: string;
        onClick: () => void;
        handleClickAsAvbryt?: boolean;
    };
    next?: {
        label?: string;
        spinner?: boolean;
        disabled?: boolean;
    };
    avbryt: {
        toRoute: string;
    };
}) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            {props.next?.disabled && (
                <Alert variant="warning" className={styles.warningAlert}>
                    <BodyShort>{formatMessage('steg.SøknadSendt')}</BodyShort>
                </Alert>
            )}
            <div className={styles.container}>
                {props.previous && (
                    <Button
                        variant="secondary"
                        type="button"
                        className={styles.navKnapp}
                        disabled={props.next?.disabled}
                        onClick={() => {
                            if (props.previous?.handleClickAsAvbryt) {
                                setModalOpen(true);
                            } else {
                                props.previous?.onClick();
                            }
                        }}
                    >
                        {props.previous.label ?? formatMessage('steg.forrige')}
                    </Button>
                )}
                <Button type="submit" className={styles.navKnapp} loading={props.next?.spinner}>
                    {props.next?.label ?? formatMessage('steg.neste')}
                </Button>
            </div>
            <div className={styles.avbrytknappContainer}>
                <Button
                    variant="tertiary"
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className={styles.avbrytknapp}
                >
                    {formatMessage('steg.avbryt')}
                </Button>
            </div>
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                header={{ heading: formatMessage('modal.tittel') }}
            >
                <Modal.Body>
                    <div className={styles.modalContainer}>
                        <div>
                            <BodyShort>{formatMessage('modal.infoTekst.p1')}</BodyShort>
                            <BodyShort>{formatMessage('modal.infoTekst.p2')}</BodyShort>
                        </div>
                        <div className={styles.modalKnappContainer}>
                            <Button variant="tertiary" type="button" onClick={() => setModalOpen(false)}>
                                {formatMessage('steg.avbryt')}
                            </Button>
                            <LinkAsButton variant="danger" href={props.avbryt.toRoute}>
                                {formatMessage('modal.lukkSøknad')}
                            </LinkAsButton>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Bunnknapper;
