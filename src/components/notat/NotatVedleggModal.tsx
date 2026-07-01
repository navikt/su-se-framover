import { BodyShort, Button, FileUpload, Heading, HStack, Loader, Modal, VStack } from '@navikt/ds-react';

import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { NotatVedlegg } from '~src/types/Notat';

import { canPreviewVedlegg, downloadVedlegg, formatVedleggBeskrivelse, openVedleggPreview } from './notatPanelUtils';

type Props = {
    open: boolean;
    kanRedigere: boolean;
    valgtFil: File | null;
    vedlegg: NotatVedlegg[];
    lasterVedlegg: boolean;
    lasterOppVedlegg: boolean;
    sletterVedlegg: boolean;
    vedleggError: ApiError | null;
    onClose: () => void;
    onSelectFile: (file: File | null) => void;
    onUpload: () => void;
    onDelete: (vedleggId: string) => void;
};

const NotatVedleggModal = (props: Props) => {
    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            aria-label={props.kanRedigere ? 'Administrer vedlegg' : 'Vis vedlegg'}
        >
            <Modal.Header>
                <Heading level="2" size="small">
                    {props.kanRedigere ? 'Administrer vedlegg' : 'Vis vedlegg'}
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <VStack gap="5">
                    {props.kanRedigere && (
                        <>
                            <FileUpload.Dropzone
                                label="Legg til vedlegg"
                                description="Last opp ett vedlegg av gangen"
                                fileLimit={{ max: 1, current: props.valgtFil ? 1 : 0 }}
                                onSelect={(files) =>
                                    props.onSelectFile(files.find((file) => !file.error)?.file ?? null)
                                }
                            />

                            {props.valgtFil && (
                                <VStack gap="3">
                                    <FileUpload.Item
                                        file={props.valgtFil}
                                        button={{
                                            action: 'delete',
                                            onClick: () => props.onSelectFile(null),
                                        }}
                                    />
                                    <HStack gap="3">
                                        <Button type="button" onClick={props.onUpload} loading={props.lasterOppVedlegg}>
                                            Last opp vedlegg
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => props.onSelectFile(null)}
                                        >
                                            Fjern valgt fil
                                        </Button>
                                    </HStack>
                                </VStack>
                            )}
                        </>
                    )}

                    <VStack gap="3">
                        <Heading level="3" size="xsmall">
                            Eksisterende vedlegg
                        </Heading>
                        {props.lasterVedlegg ? (
                            <Loader size="small" title="Henter vedlegg" />
                        ) : props.vedleggError ? (
                            <ApiErrorAlert error={props.vedleggError} size="small" />
                        ) : props.vedlegg.length ? (
                            <FileUpload>
                                <VStack gap="3" as="ul">
                                    {props.vedlegg.map((vedlegg) => (
                                        <FileUpload.Item
                                            key={vedlegg.id}
                                            as="li"
                                            file={{ name: vedlegg.filnavn, size: 0 }}
                                            onFileClick={(event) => {
                                                event.preventDefault();
                                                if (canPreviewVedlegg(vedlegg.mimeType)) {
                                                    openVedleggPreview(vedlegg.mimeType, vedlegg.innhold);
                                                } else {
                                                    downloadVedlegg(vedlegg.filnavn, vedlegg.mimeType, vedlegg.innhold);
                                                }
                                            }}
                                            description={formatVedleggBeskrivelse(vedlegg.opprettet)}
                                            button={
                                                <HStack gap="2" align="center">
                                                    {canPreviewVedlegg(vedlegg.mimeType) && (
                                                        <Button
                                                            type="button"
                                                            size="small"
                                                            variant="tertiary"
                                                            onClick={() =>
                                                                openVedleggPreview(vedlegg.mimeType, vedlegg.innhold)
                                                            }
                                                        >
                                                            Forhåndsvis
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        size="small"
                                                        variant="tertiary"
                                                        onClick={() =>
                                                            downloadVedlegg(
                                                                vedlegg.filnavn,
                                                                vedlegg.mimeType,
                                                                vedlegg.innhold,
                                                            )
                                                        }
                                                    >
                                                        Last ned
                                                    </Button>
                                                    {props.kanRedigere && (
                                                        <Button
                                                            type="button"
                                                            size="small"
                                                            variant="tertiary"
                                                            onClick={() => props.onDelete(vedlegg.id)}
                                                            loading={props.sletterVedlegg}
                                                        >
                                                            Slett
                                                        </Button>
                                                    )}
                                                </HStack>
                                            }
                                        />
                                    ))}
                                </VStack>
                            </FileUpload>
                        ) : (
                            <BodyShort>Ingen vedlegg enda.</BodyShort>
                        )}
                    </VStack>
                </VStack>
            </Modal.Body>
        </Modal>
    );
};

export default NotatVedleggModal;
