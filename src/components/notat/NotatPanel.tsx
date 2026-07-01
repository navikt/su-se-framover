import { Box, VStack } from '@navikt/ds-react';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';

import NotatEndringModal from './NotatEndringModal.tsx';
import NotatFeedback from './NotatFeedback';
import NotatToolbar from './NotatToolbar';
import NotatVedleggModal from './NotatVedleggModal';
import styles from './notatPanel.module.less';
import { NotatPanelProps } from './notatPanelTypes';
import { useNotatEditor } from './useNotatEditor';
import { useNotatFeedback } from './useNotatFeedback';
import { useNotatHook } from './useNotatHook.ts';
import { useNotatVedlegg } from './useNotatVedlegg';

const NotatPanel = (props: NotatPanelProps) => {
    const feedback = useNotatFeedback();
    const notatHook = useNotatHook({
        ...props,
        clearFeedback: feedback.clearFeedback,
        onError: feedback.showError,
        onSuccess: feedback.showSuccess,
    });
    const editor = useNotatEditor({
        sakId: props.sakId,
        notat: notatHook.notat,
        underAttestering: props.underAttestering,
        kanRedigere: props.kanRedigere,
        onError: feedback.showError,
        onSuccess: feedback.showSuccess,
        oppdaterLokaltNotat: notatHook.oppdaterLokaltNotat,
    });
    const vedlegg = useNotatVedlegg({
        sakId: props.sakId,
        notat: notatHook.notat,
        kanRedigere: props.kanRedigere,
        onError: feedback.showError,
        onSuccess: feedback.showSuccess,
        oppdaterLokaltNotat: notatHook.oppdaterLokaltNotat,
    });

    if (notatHook.visLaster) {
        return (
            <div className={styles.container}>
                <SpinnerMedTekst />
            </div>
        );
    }

    return (
        <Box background="surface-default" padding="5" borderRadius="medium" className={styles.container}>
            <VStack gap="4">
                <NotatToolbar
                    notat={notatHook.notat}
                    manglerNotat={notatHook.manglerNotat}
                    kanRedigere={props.kanRedigere}
                    harAttestantNotat={editor.harAttestantNotat}
                    kanRedigereSaksbehandlernotat={editor.kanRedigereSaksbehandlernotat}
                    kanRedigereAttestantnotat={editor.kanRedigereAttestantnotat}
                    skalViseVedleggsknapp={vedlegg.skalViseVedleggsknapp}
                    antallVedlegg={vedlegg.antallVedlegg}
                    lasterNotat={notatHook.visLaster}
                    oppretterNotat={notatHook.oppretterNotat}
                    statusElement={
                        <NotatFeedback
                            successMessage={feedback.successMessage}
                            actionError={feedback.actionError}
                            notatError={notatHook.notatError}
                        />
                    }
                    onOpprettNotat={notatHook.onOpprettNotat}
                    onOpenSaksbehandler={editor.onOpenSaksbehandler}
                    onOpenVedlegg={vedlegg.onOpenVedlegg}
                    onOpenAttestant={editor.onOpenAttestant}
                />
            </VStack>

            {notatHook.notat && (
                <>
                    <NotatEndringModal {...editor.tekstModal} />
                    <NotatVedleggModal {...vedlegg.vedleggModal} />
                </>
            )}
        </Box>
    );
};

export default NotatPanel;
