import { Button, Modal } from '@navikt/ds-react';
import { useState } from 'react';
import KontrollsamtaleDriftOversikt from '~src/components/kontrollsamtaleDriftOversikt/KontrollsamtaleDriftOversikt';
import sharedStyles from '../index.module.less';

const KontrollsamtaleOversikt = () => {
    const [visKontrollsamtaleOversikt, setKontrollsamtaleOversikt] = useState<boolean>(false);

    return (
        <div>
            <Button
                className={sharedStyles.knapp}
                variant="secondary"
                type="button"
                onClick={() => setKontrollsamtaleOversikt(true)}
            >
                Kontrollsamtaler
            </Button>
            {visKontrollsamtaleOversikt && (
                <KontrollsamtalerModal
                    open={visKontrollsamtaleOversikt}
                    onClose={() => setKontrollsamtaleOversikt(false)}
                />
            )}
        </div>
    );
};

const KontrollsamtalerModal = (props: { open: boolean; onClose: () => void }) => {
    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            aria-label={'Statistikk'}
            header={{ heading: 'Kontrollsamtaler' }}
        >
            <Modal.Body>
                <KontrollsamtaleDriftOversikt />
            </Modal.Body>
        </Modal>
    );
};

export default KontrollsamtaleOversikt;
