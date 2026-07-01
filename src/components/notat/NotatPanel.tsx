import * as RemoteData from '@devexperts/remote-data-ts';
import {
    Alert,
    BodyShort,
    Box,
    Button,
    FileUpload,
    Heading,
    HStack,
    Label,
    Loader,
    Modal,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import * as notatApi from '~src/api/notatApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';
import { useApiCall } from '~src/lib/hooks';
import { NotatResponse, OpprettNotatBody, ReferanseType } from '~src/types/Notat';
import styles from './notatPanel.module.less';

type Props = {
    sakId: string;
    referanseId: string;
    referanseType: ReferanseType;
    underAttestering: boolean;
    kanRedigere: boolean;
};

type ActionFeedback =
    | { type: 'success'; message: string }
    | { type: 'error'; error: Parameters<typeof ApiErrorAlert>[0]['error'] }
    | null;

const NotatPanel = (props: Props) => {
    const [notatStatus, hentNotat, resetNotat] = useApiCall(notatApi.hentNotat);
    const [notatMedVedleggStatus, hentNotatMedVedlegg, resetNotatMedVedlegg] = useApiCall(
        (request: { sakId: string; notatId: string }) => notatApi.hentNotatMedVedlegg(request.sakId, request.notatId),
    );
    const [opprettStatus, opprettNotat, resetOpprettStatus] = useApiCall(
        (request: { sakId: string; body: OpprettNotatBody }) => notatApi.opprettNotat(request.sakId, request.body),
    );
    const [lagreSaksbehandlerStatus, lagreSaksbehandlerNotat, resetLagreSaksbehandlerStatus] = useApiCall(
        notatApi.oppdaterNotatSomSaksbehandler,
    );
    const [lagreAttestantStatus, lagreAttestantNotat, resetLagreAttestantStatus] = useApiCall(
        notatApi.oppdaterNotatSomAttestant,
    );
    const [vedleggStatus, leggTilVedlegg, resetVedleggStatus] = useApiCall(notatApi.leggTilVedlegg);
    const [slettVedleggStatus, slettVedlegg, resetSlettVedleggStatus] = useApiCall(notatApi.slettVedlegg);
    const [notatTekst, setNotatTekst] = useState('');
    const [valgtFil, setValgtFil] = useState<File | null>(null);
    const [feedback, setFeedback] = useState<ActionFeedback>(null);
    const [lokalNotat, setLokalNotat] = useState<NotatResponse | null>(null);
    const [visRedigerModal, setVisRedigerModal] = useState(false);
    const [visVedleggModal, setVisVedleggModal] = useState(false);
    const [visAttestantModal, setVisAttestantModal] = useState(false);

    useEffect(() => {
        resetNotat();
        setValgtFil(null);
        setNotatTekst('');
        setFeedback(null);
        setLokalNotat(null);
        setVisRedigerModal(false);
        setVisVedleggModal(false);
        setVisAttestantModal(false);
        resetOpprettStatus();
        resetLagreSaksbehandlerStatus();
        resetLagreAttestantStatus();
        resetNotatMedVedlegg();
        resetVedleggStatus();
        resetSlettVedleggStatus();
        hentNotat({
            sakId: props.sakId,
            referanseId: props.referanseId,
            referanseType: props.referanseType,
        });
    }, [
        props.sakId,
        props.referanseId,
        props.referanseType,
        resetNotat,
        resetOpprettStatus,
        resetLagreSaksbehandlerStatus,
        resetLagreAttestantStatus,
        resetNotatMedVedlegg,
        resetVedleggStatus,
        resetSlettVedleggStatus,
    ]);

    useEffect(() => {
        if (RemoteData.isSuccess(notatStatus)) {
            setLokalNotat(notatStatus.value);
        }
    }, [notatStatus]);

    useEffect(() => {
        if (!feedback) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setFeedback(null);
        }, 5000);

        return () => window.clearTimeout(timeoutId);
    }, [feedback]);

    const notat = lokalNotat;
    const notatMedVedlegg = RemoteData.isSuccess(notatMedVedleggStatus) ? notatMedVedleggStatus.value : null;
    const manglerNotat = RemoteData.isSuccess(notatStatus) && notatStatus.value === null;
    const attestantNotat = notat?.attestantNotat ?? '';
    const harAttestantNotat = Boolean(attestantNotat.trim());
    const redigerbartNotat = props.underAttestering ? attestantNotat : (notat?.notat ?? '');
    const antallVedlegg = notat?.antallVedlegg ?? 0;
    const skalViseVedleggsknapp = props.kanRedigere || antallVedlegg > 0;

    useEffect(() => {
        setNotatTekst(redigerbartNotat);
    }, [redigerbartNotat, notat?.id, notat?.endret]);

    useEffect(() => {
        if (RemoteData.isFailure(opprettStatus)) {
            setFeedback({ type: 'error', error: opprettStatus.error });
            resetOpprettStatus();
        }
    }, [opprettStatus, resetOpprettStatus]);

    useEffect(() => {
        if (RemoteData.isSuccess(opprettStatus)) {
            const opprettetNotat: NotatResponse = {
                ...opprettStatus.value.notat,
                antallVedlegg: opprettStatus.value.vedlegg.length,
            };

            setFeedback({ type: 'success', message: 'Notat opprettet' });
            setLokalNotat(opprettetNotat);
            setNotatTekst(
                props.underAttestering ? (opprettetNotat.attestantNotat ?? '') : (opprettetNotat.notat ?? ''),
            );
            if (props.kanRedigere) {
                setVisRedigerModal(true);
            }
            resetNotatMedVedlegg();
            resetOpprettStatus();
        }
    }, [opprettStatus, props.underAttestering, props.kanRedigere, resetNotatMedVedlegg, resetOpprettStatus]);

    useEffect(() => {
        if (RemoteData.isFailure(lagreSaksbehandlerStatus)) {
            setFeedback({ type: 'error', error: lagreSaksbehandlerStatus.error });
            resetLagreSaksbehandlerStatus();
        }
    }, [lagreSaksbehandlerStatus, resetLagreSaksbehandlerStatus]);

    useEffect(() => {
        if (RemoteData.isSuccess(lagreSaksbehandlerStatus)) {
            setFeedback({ type: 'success', message: 'Saksbehandlernotat lagret' });
            setLokalNotat((gjeldendeNotat) =>
                gjeldendeNotat
                    ? {
                          ...gjeldendeNotat,
                          notat: notatTekst,
                          endret: new Date().toISOString(),
                      }
                    : gjeldendeNotat,
            );
            setVisRedigerModal(false);
            resetLagreSaksbehandlerStatus();
        }
    }, [lagreSaksbehandlerStatus, notatTekst, resetLagreSaksbehandlerStatus]);

    useEffect(() => {
        if (RemoteData.isFailure(lagreAttestantStatus)) {
            setFeedback({ type: 'error', error: lagreAttestantStatus.error });
            resetLagreAttestantStatus();
        }
    }, [lagreAttestantStatus, resetLagreAttestantStatus]);

    useEffect(() => {
        if (RemoteData.isSuccess(lagreAttestantStatus)) {
            setFeedback({ type: 'success', message: 'Attestantnotat lagret' });
            setLokalNotat((gjeldendeNotat) =>
                gjeldendeNotat
                    ? {
                          ...gjeldendeNotat,
                          attestantNotat: notatTekst,
                          endret: new Date().toISOString(),
                      }
                    : gjeldendeNotat,
            );
            setVisRedigerModal(false);
            resetLagreAttestantStatus();
        }
    }, [lagreAttestantStatus, notatTekst, resetLagreAttestantStatus]);

    useEffect(() => {
        if (RemoteData.isFailure(vedleggStatus)) {
            setFeedback({ type: 'error', error: vedleggStatus.error });
            resetVedleggStatus();
        }
    }, [vedleggStatus, resetVedleggStatus]);

    useEffect(() => {
        if (RemoteData.isSuccess(vedleggStatus)) {
            setValgtFil(null);
            setFeedback({ type: 'success', message: 'Vedlegg lastet opp' });
            setLokalNotat((gjeldendeNotat) =>
                gjeldendeNotat
                    ? {
                          ...gjeldendeNotat,
                          antallVedlegg: gjeldendeNotat.antallVedlegg + 1,
                          endret: new Date().toISOString(),
                      }
                    : gjeldendeNotat,
            );
            refreshVedlegg();
            resetVedleggStatus();
        }
    }, [vedleggStatus, resetVedleggStatus]);

    useEffect(() => {
        if (RemoteData.isFailure(slettVedleggStatus)) {
            setFeedback({ type: 'error', error: slettVedleggStatus.error });
            resetSlettVedleggStatus();
        }
    }, [slettVedleggStatus, resetSlettVedleggStatus]);

    useEffect(() => {
        if (RemoteData.isSuccess(slettVedleggStatus)) {
            setFeedback({ type: 'success', message: 'Vedlegg slettet' });
            setLokalNotat((gjeldendeNotat) =>
                gjeldendeNotat
                    ? {
                          ...gjeldendeNotat,
                          antallVedlegg: Math.max(0, gjeldendeNotat.antallVedlegg - 1),
                          endret: new Date().toISOString(),
                      }
                    : gjeldendeNotat,
            );
            refreshVedlegg();
            resetSlettVedleggStatus();
        }
    }, [slettVedleggStatus, resetSlettVedleggStatus]);

    const refreshVedlegg = () => {
        if (!notat) {
            resetNotatMedVedlegg();
            return;
        }

        hentNotatMedVedlegg({
            sakId: props.sakId,
            notatId: notat.id,
        });
    };

    const handleÅpneVedleggModal = () => {
        setVisVedleggModal(true);
        refreshVedlegg();
    };

    const lagBlobUrlForVedlegg = (mimeType: string, innhold: string) => {
        const byteString = window.atob(innhold);
        const byteArray = new Uint8Array(byteString.length);

        for (let i = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: mimeType });
        return URL.createObjectURL(blob);
    };

    const åpneVedleggForhåndsvisning = (mimeType: string, innhold: string) => {
        const url = lagBlobUrlForVedlegg(mimeType, innhold);
        window.open(url, '_blank', 'noopener,noreferrer');
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    };

    const lastNedVedlegg = (filnavn: string, mimeType: string, innhold: string) => {
        const url = lagBlobUrlForVedlegg(mimeType, innhold);
        const lenke = document.createElement('a');
        lenke.href = url;
        lenke.download = filnavn;
        document.body.appendChild(lenke);
        lenke.click();
        lenke.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    };

    const handleOpprettNotat = () => {
        opprettNotat({
            sakId: props.sakId,
            body: {
                referanseId: props.referanseId,
                referanseType: props.referanseType,
            },
        });
    };

    const handleLagreNotat = () => {
        if (!notat) {
            return;
        }

        const lagre = props.underAttestering ? lagreAttestantNotat : lagreSaksbehandlerNotat;
        lagre({
            sakId: props.sakId,
            notatId: notat.id,
            notat: notatTekst,
        });
    };

    const handleLastOppVedlegg = () => {
        if (!notat || !valgtFil) {
            return;
        }

        leggTilVedlegg({
            sakId: props.sakId,
            notatId: notat.id,
            filnavn: valgtFil.name,
            fil: valgtFil,
        });
    };

    const handleSlettVedlegg = (vedleggId: string) => {
        if (!notat) {
            return;
        }

        slettVedlegg({
            sakId: props.sakId,
            notatId: notat.id,
            vedleggId,
        });
    };

    if (RemoteData.isInitial(notatStatus) || RemoteData.isPending(notatStatus)) {
        return (
            <div className={styles.container}>
                <SpinnerMedTekst />
            </div>
        );
    }

    return (
        <Box background="surface-default" padding="5" borderRadius="medium" className={styles.container}>
            <VStack gap="4">
                <div className={styles.topBar}>
                    <div className={styles.topBarContent}>
                        <HStack gap="3" align="center" className={styles.actionRow}>
                            <Heading level="2" size="small">
                                Notat
                            </Heading>
                            {RemoteData.isPending(notatStatus) && <Loader size="small" title="Henter notat" />}
                            {manglerNotat && props.kanRedigere && (
                                <Button
                                    type="button"
                                    size="small"
                                    onClick={handleOpprettNotat}
                                    loading={RemoteData.isPending(opprettStatus)}
                                >
                                    Lag notat
                                </Button>
                            )}
                            {notat && (
                                <>
                                    <Button type="button" size="small" onClick={() => setVisRedigerModal(true)}>
                                        {props.kanRedigere
                                            ? props.underAttestering
                                                ? 'Rediger attestantnotat'
                                                : 'Rediger notat'
                                            : 'Vis notat'}
                                    </Button>
                                    {skalViseVedleggsknapp && (
                                        <Button
                                            type="button"
                                            size="small"
                                            variant="secondary"
                                            onClick={handleÅpneVedleggModal}
                                        >
                                            {props.kanRedigere && antallVedlegg === 0
                                                ? 'Legg til vedlegg'
                                                : `Vis vedlegg (${antallVedlegg})`}
                                        </Button>
                                    )}
                                    {harAttestantNotat && (
                                        <Button
                                            type="button"
                                            size="small"
                                            variant="tertiary"
                                            onClick={() => setVisAttestantModal(true)}
                                        >
                                            Vis attestantnotat
                                        </Button>
                                    )}
                                </>
                            )}
                            {feedback?.type === 'success' && (
                                <Alert
                                    variant="success"
                                    size="small"
                                    contentMaxWidth={false}
                                    className={styles.feedbackBox}
                                >
                                    <BodyShort>{feedback.message}</BodyShort>
                                </Alert>
                            )}
                            {feedback?.type === 'error' && (
                                <ApiErrorAlert error={feedback.error} className={styles.feedbackBox} size="small" />
                            )}
                            {RemoteData.isFailure(notatStatus) && notatStatus.error.statusCode !== 404 && (
                                <ApiErrorAlert error={notatStatus.error} className={styles.feedbackBox} size="small" />
                            )}
                        </HStack>

                        {notat && (
                            <HStack gap="6" className={styles.summaryRow}>
                                <div className={styles.metaBlock}>
                                    <Label size="small">Sist endret</Label>
                                    <BodyShort>{formatTidspunkt(notat.endret)}</BodyShort>
                                </div>
                                <div className={styles.metaBlock}>
                                    <Label size="small">Opprettet</Label>
                                    <BodyShort>{formatTidspunkt(notat.opprettet)}</BodyShort>
                                </div>
                            </HStack>
                        )}
                    </div>
                </div>
            </VStack>

            {notat && (
                <>
                    <Modal
                        open={visRedigerModal}
                        onClose={() => setVisRedigerModal(false)}
                        aria-label={
                            props.kanRedigere
                                ? props.underAttestering
                                    ? 'Rediger attestantnotat'
                                    : 'Rediger notat'
                                : 'Vis notat'
                        }
                    >
                        <Modal.Header>
                            <Heading level="2" size="small">
                                {props.kanRedigere
                                    ? props.underAttestering
                                        ? 'Rediger attestantnotat'
                                        : 'Rediger notat'
                                    : 'Vis notat'}
                            </Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <VStack gap="4">
                                <Textarea
                                    label={props.underAttestering ? 'Attestantnotat' : 'Saksbehandlernotat'}
                                    value={notatTekst}
                                    onChange={(event) => setNotatTekst(event.target.value)}
                                    readOnly={!props.kanRedigere}
                                    resize
                                    minRows={8}
                                />
                                <HStack gap="3">
                                    {props.kanRedigere ? (
                                        <>
                                            <Button
                                                type="button"
                                                onClick={handleLagreNotat}
                                                loading={
                                                    RemoteData.isPending(lagreSaksbehandlerStatus) ||
                                                    RemoteData.isPending(lagreAttestantStatus)
                                                }
                                            >
                                                Lagre
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => setVisRedigerModal(false)}
                                            >
                                                Avbryt
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setVisRedigerModal(false)}
                                        >
                                            Lukk
                                        </Button>
                                    )}
                                </HStack>
                            </VStack>
                        </Modal.Body>
                    </Modal>

                    <Modal
                        open={visVedleggModal}
                        onClose={() => setVisVedleggModal(false)}
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
                                            fileLimit={{ max: 1, current: valgtFil ? 1 : 0 }}
                                            onSelect={(files) =>
                                                setValgtFil(files.find((file) => !file.error)?.file ?? null)
                                            }
                                        />

                                        {valgtFil && (
                                            <VStack gap="3">
                                                <FileUpload.Item
                                                    file={valgtFil}
                                                    button={{
                                                        action: 'delete',
                                                        onClick: () => setValgtFil(null),
                                                    }}
                                                />
                                                <HStack gap="3">
                                                    <Button
                                                        type="button"
                                                        onClick={handleLastOppVedlegg}
                                                        loading={RemoteData.isPending(vedleggStatus)}
                                                    >
                                                        Last opp vedlegg
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={() => setValgtFil(null)}
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
                                    {RemoteData.isPending(notatMedVedleggStatus) ? (
                                        <Loader size="small" title="Henter vedlegg" />
                                    ) : RemoteData.isFailure(notatMedVedleggStatus) ? (
                                        <ApiErrorAlert error={notatMedVedleggStatus.error} size="small" />
                                    ) : notatMedVedlegg?.vedlegg.length ? (
                                        <FileUpload>
                                            <VStack gap="3" as="ul">
                                                {notatMedVedlegg.vedlegg.map((vedlegg) => (
                                                    <FileUpload.Item
                                                        key={vedlegg.id}
                                                        as="li"
                                                        file={{ name: vedlegg.filnavn, size: 0 }}
                                                        onFileClick={(event) => {
                                                            event.preventDefault();
                                                            åpneVedleggForhåndsvisning(
                                                                vedlegg.mimeType,
                                                                vedlegg.innhold,
                                                            );
                                                        }}
                                                        description={formatVedleggBeskrivelse(vedlegg.opprettet)}
                                                        button={
                                                            <HStack gap="2" align="center">
                                                                <Button
                                                                    type="button"
                                                                    size="small"
                                                                    variant="tertiary"
                                                                    onClick={() =>
                                                                        lastNedVedlegg(
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
                                                                        onClick={() => handleSlettVedlegg(vedlegg.id)}
                                                                        loading={RemoteData.isPending(
                                                                            slettVedleggStatus,
                                                                        )}
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

                    <Modal
                        open={visAttestantModal}
                        onClose={() => setVisAttestantModal(false)}
                        aria-label="Attestantnotat"
                    >
                        <Modal.Header>
                            <Heading level="2" size="small">
                                Attestantnotat
                            </Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <BodyShort>{attestantNotat || 'Attestantnotatet er ikke fylt ut enda.'}</BodyShort>
                        </Modal.Body>
                    </Modal>
                </>
            )}
        </Box>
    );
};

const formatTidspunkt = (tidspunkt: string) =>
    new Intl.DateTimeFormat('nb-NO', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(tidspunkt));

const formatVedleggBeskrivelse = (opprettet: string) => `Lastet opp ${formatTidspunkt(opprettet)}`;

export default NotatPanel;
