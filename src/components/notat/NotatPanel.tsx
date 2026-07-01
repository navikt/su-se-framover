import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Box, VStack } from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import * as notatApi from '~src/api/notatApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';
import { useApiCall } from '~src/lib/hooks';
import { NotatResponse, OpprettNotatBody, ReferanseType } from '~src/types/Notat';
import NotatEditorModal from './NotatEditorModal';
import NotatToolbar from './NotatToolbar';
import NotatVedleggModal from './NotatVedleggModal';
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
    const [saksbehandlerTekst, setSaksbehandlerTekst] = useState('');
    const [attestantTekst, setAttestantTekst] = useState('');
    const [valgtFil, setValgtFil] = useState<File | null>(null);
    const [feedback, setFeedback] = useState<ActionFeedback>(null);
    const [lokalNotat, setLokalNotat] = useState<NotatResponse | null>(null);
    const [åpenTekstModal, setÅpenTekstModal] = useState<'saksbehandler' | 'attestant' | null>(null);
    const [visVedleggModal, setVisVedleggModal] = useState(false);

    useEffect(() => {
        resetNotat();
        setValgtFil(null);
        setSaksbehandlerTekst('');
        setAttestantTekst('');
        setFeedback(null);
        setLokalNotat(null);
        setÅpenTekstModal(null);
        setVisVedleggModal(false);
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
    const manglerNotat = notat === null && RemoteData.isSuccess(notatStatus) && notatStatus.value === null;
    const saksbehandlerNotat = notat?.notat ?? '';
    const attestantNotat = notat?.attestantNotat ?? '';
    const harAttestantNotat = attestantNotat.length > 0;
    const antallVedlegg = notat?.antallVedlegg ?? 0;
    const skalViseVedleggsknapp = props.kanRedigere || antallVedlegg > 0;
    const kanRedigereSaksbehandlernotat = props.kanRedigere && !props.underAttestering;
    const kanRedigereAttestantnotat = props.kanRedigere && props.underAttestering;
    const aktivtModalfelt = åpenTekstModal === 'attestant' ? attestantTekst : saksbehandlerTekst;
    const kanRedigereAktivtModalfelt =
        åpenTekstModal === 'attestant' ? kanRedigereAttestantnotat : kanRedigereSaksbehandlernotat;

    useEffect(() => {
        if (RemoteData.isFailure(opprettStatus)) {
            setFeedback({ type: 'error', error: opprettStatus.error });
            resetOpprettStatus();
        }
    }, [opprettStatus, resetOpprettStatus]);

    useEffect(() => {
        if (RemoteData.isSuccess(opprettStatus)) {
            const opprettetNotat: NotatResponse = {
                ...opprettStatus.value,
                antallVedlegg: 0,
            };

            setFeedback({ type: 'success', message: 'Notat opprettet' });
            setLokalNotat(opprettetNotat);
            setSaksbehandlerTekst(opprettetNotat.notat ?? '');
            setAttestantTekst(opprettetNotat.attestantNotat ?? '');
            resetNotatMedVedlegg();
            resetOpprettStatus();
        }
    }, [opprettStatus, props.underAttestering, props.kanRedigere, resetNotatMedVedlegg, resetOpprettStatus]);

    useEffect(() => {
        setSaksbehandlerTekst(saksbehandlerNotat);
    }, [saksbehandlerNotat, notat?.id, notat?.endret]);

    useEffect(() => {
        setAttestantTekst(attestantNotat);
    }, [attestantNotat, notat?.id, notat?.endret]);

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
                          notat: saksbehandlerTekst,
                          endret: new Date().toISOString(),
                      }
                    : gjeldendeNotat,
            );
            setÅpenTekstModal(null);
            resetLagreSaksbehandlerStatus();
        }
    }, [lagreSaksbehandlerStatus, saksbehandlerTekst, resetLagreSaksbehandlerStatus]);

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
                          attestantNotat: attestantTekst,
                          endret: new Date().toISOString(),
                      }
                    : gjeldendeNotat,
            );
            setÅpenTekstModal(null);
            resetLagreAttestantStatus();
        }
    }, [lagreAttestantStatus, attestantTekst, resetLagreAttestantStatus]);

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
        if (!notat || !åpenTekstModal) {
            return;
        }

        if (åpenTekstModal === 'attestant') {
            lagreAttestantNotat({
                sakId: props.sakId,
                notatId: notat.id,
                notat: attestantTekst,
            });
            return;
        }

        lagreSaksbehandlerNotat({
            sakId: props.sakId,
            notatId: notat.id,
            notat: saksbehandlerTekst,
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

    const statusElement = (
        <>
            {feedback?.type === 'success' && (
                <Alert variant="success" size="small" contentMaxWidth={false} className={styles.feedbackBox}>
                    <BodyShort>{feedback.message}</BodyShort>
                </Alert>
            )}
            {feedback?.type === 'error' && (
                <ApiErrorAlert error={feedback.error} className={styles.feedbackBox} size="small" />
            )}
            {RemoteData.isFailure(notatStatus) && notatStatus.error.statusCode !== 404 && (
                <ApiErrorAlert error={notatStatus.error} className={styles.feedbackBox} size="small" />
            )}
        </>
    );

    return (
        <Box background="surface-default" padding="5" borderRadius="medium" className={styles.container}>
            <VStack gap="4">
                <NotatToolbar
                    notat={notat}
                    manglerNotat={manglerNotat}
                    underAttestering={props.underAttestering}
                    kanRedigere={props.kanRedigere}
                    harAttestantNotat={harAttestantNotat}
                    kanRedigereSaksbehandlernotat={kanRedigereSaksbehandlernotat}
                    kanRedigereAttestantnotat={kanRedigereAttestantnotat}
                    skalViseVedleggsknapp={skalViseVedleggsknapp}
                    antallVedlegg={antallVedlegg}
                    lasterNotat={RemoteData.isPending(notatStatus)}
                    oppretterNotat={RemoteData.isPending(opprettStatus)}
                    statusElement={statusElement}
                    onOpprettNotat={handleOpprettNotat}
                    onOpenEditor={() => setÅpenTekstModal('saksbehandler')}
                    onOpenVedlegg={handleÅpneVedleggModal}
                    onOpenAttestant={() => setÅpenTekstModal('attestant')}
                />
            </VStack>

            {notat && (
                <>
                    <NotatEditorModal
                        open={åpenTekstModal !== null}
                        editorType={åpenTekstModal ?? 'saksbehandler'}
                        kanRedigere={kanRedigereAktivtModalfelt}
                        notatTekst={aktivtModalfelt}
                        lagrer={
                            RemoteData.isPending(lagreSaksbehandlerStatus) || RemoteData.isPending(lagreAttestantStatus)
                        }
                        onClose={() => setÅpenTekstModal(null)}
                        onNotatTekstChange={(value) => {
                            if (åpenTekstModal === 'attestant') {
                                setAttestantTekst(value);
                                return;
                            }
                            setSaksbehandlerTekst(value);
                        }}
                        onSave={handleLagreNotat}
                    />

                    <NotatVedleggModal
                        open={visVedleggModal}
                        kanRedigere={props.kanRedigere}
                        valgtFil={valgtFil}
                        vedlegg={notatMedVedlegg?.vedlegg ?? []}
                        lasterVedlegg={RemoteData.isPending(notatMedVedleggStatus)}
                        lasterOppVedlegg={RemoteData.isPending(vedleggStatus)}
                        sletterVedlegg={RemoteData.isPending(slettVedleggStatus)}
                        vedleggError={
                            RemoteData.isFailure(notatMedVedleggStatus) ? (
                                <ApiErrorAlert error={notatMedVedleggStatus.error} size="small" />
                            ) : undefined
                        }
                        onClose={() => setVisVedleggModal(false)}
                        onSelectFile={setValgtFil}
                        onUpload={handleLastOppVedlegg}
                        onDelete={handleSlettVedlegg}
                    />
                </>
            )}
        </Box>
    );
};

export default NotatPanel;
