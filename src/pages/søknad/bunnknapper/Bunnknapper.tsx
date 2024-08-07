import { BodyShort, Button, Modal } from '@navikt/ds-react';
import { useState } from 'react';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useI18n } from '~src/lib/i18n';

import messages from './bunnknapper-nb';
import styles from './bunnknapper.module.less';

const Bunnknapper = (props: {
    previous?: {
        label?: string;
        onClick: () => void;
        handleClickAsAvbryt?: boolean;
    };
    next?: {
        label?: string;
        spinner?: boolean;
    };
    avbryt: {
        toRoute: string;
    };
}) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <div className={styles.container}>
                {props.previous && (
                    <Button
                        variant="secondary"
                        type="button"
                        className={styles.navKnapp}
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
