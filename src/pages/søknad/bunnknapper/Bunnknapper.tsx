import { Button, Loader } from '@navikt/ds-react';
import ModalWrapper from 'nav-frontend-modal';
import { Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import TextProvider from '~components/TextProvider';
import { Languages } from '~lib/i18n';

import messages from './bunnknapper-nb';
import styles from './bunnknapper.module.less';

const Bunnknapper = (props: {
    previous?: {
        label?: React.ReactNode;
        onClick: () => void;
        handleClickAsAvbryt?: boolean;
    };
    next?: {
        label?: React.ReactNode;
        spinner?: boolean;
    };
    avbryt: {
        toRoute: string;
    };
}) => {
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div className={styles.container}>
                <Button type="submit" className={styles.navKnapp}>
                    {props.next?.label ?? <FormattedMessage id="steg.neste" />}
                    {props.next?.spinner && <Loader />}
                </Button>
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
                        {props.previous.label ?? <FormattedMessage id="steg.forrige" />}
                    </Button>
                )}
            </div>
            <div className={styles.avbrytknappContainer}>
                <Button variant="tertiary" type="button" onClick={() => setModalOpen(true)}>
                    <FormattedMessage id="steg.avbryt" />
                </Button>
            </div>
            <ModalWrapper
                isOpen={modalOpen}
                closeButton={true}
                onRequestClose={() => setModalOpen(false)}
                contentLabel={'lukkSøknad'}
            >
                <div className={styles.modalContainer}>
                    <Undertittel className={styles.modalTittel}>
                        <FormattedMessage id="modal.tittel" />
                    </Undertittel>
                    <p>
                        <FormattedMessage id="modal.infoTekst.p1" />
                    </p>
                    <p>
                        <FormattedMessage id="modal.infoTekst.p2" />
                    </p>
                    <div className={styles.modalKnappContainer}>
                        <Button variant="tertiary" onClick={() => setModalOpen(false)}>
                            <FormattedMessage id="steg.avbryt" />
                        </Button>
                        <Link className="knapp knapp--fare" to={props.avbryt.toRoute}>
                            <FormattedMessage id="modal.lukkSøknad" />
                        </Link>
                    </div>
                </div>
            </ModalWrapper>
        </TextProvider>
    );
};

export default Bunnknapper;
