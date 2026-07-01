import { Button, Heading, HStack, Modal, Textarea, VStack } from '@navikt/ds-react';

type Props = {
    open: boolean;
    editorType: 'saksbehandler' | 'attestant';
    kanRedigere: boolean;
    notatTekst: string;
    lagrer: boolean;
    onClose: () => void;
    onNotatTekstChange: (value: string) => void;
    onSave: () => void;
};

const NotatEditorModal = (props: Props) => {
    const erTilAttestering = props.editorType === 'attestant';
    const tittel = props.kanRedigere ? (erTilAttestering ? 'Rediger attestantnotat' : 'Rediger notat') : 'Vis notat';

    return (
        <Modal open={props.open} onClose={props.onClose} aria-label={tittel}>
            <Modal.Header>
                <Heading level="2" size="small">
                    {tittel}
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <VStack gap="4">
                    <Textarea
                        label={erTilAttestering ? 'Attestantnotat' : 'Saksbehandlernotat'}
                        value={props.notatTekst}
                        onChange={(event) => props.onNotatTekstChange(event.target.value)}
                        readOnly={!props.kanRedigere}
                        resize
                        minRows={8}
                    />
                    <HStack gap="3">
                        {props.kanRedigere ? (
                            <>
                                <Button type="button" onClick={props.onSave} loading={props.lagrer}>
                                    Lagre
                                </Button>
                                <Button type="button" variant="secondary" onClick={props.onClose}>
                                    Avbryt
                                </Button>
                            </>
                        ) : (
                            <Button type="button" variant="secondary" onClick={props.onClose}>
                                Lukk
                            </Button>
                        )}
                    </HStack>
                </VStack>
            </Modal.Body>
        </Modal>
    );
};

export default NotatEditorModal;
