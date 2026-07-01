import { BodyShort, Heading, Modal } from '@navikt/ds-react';

type Props = {
    open: boolean;
    attestantNotat: string;
    onClose: () => void;
};

const AttestantNotatModal = (props: Props) => {
    return (
        <Modal open={props.open} onClose={props.onClose} aria-label="Attestantnotat">
            <Modal.Header>
                <Heading level="2" size="small">
                    Attestantnotat
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <BodyShort>{props.attestantNotat || 'Attestantnotatet er ikke fylt ut enda.'}</BodyShort>
            </Modal.Body>
        </Modal>
    );
};

export default AttestantNotatModal;
