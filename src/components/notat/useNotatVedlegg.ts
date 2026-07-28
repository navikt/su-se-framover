import * as RemoteData from '@devexperts/remote-data-ts';
import { useEffect, useState } from 'react';
import { ApiError } from '~src/api/apiClient';
import * as notatApi from '~src/api/notatApi';
import { useApiCall } from '~src/lib/hooks';
import { NotatResponse } from '~src/types/Notat';

import { NotatOppdatering } from './notatPanelTypes';

type Props = {
    sakId: string;
    notat: NotatResponse | null;
    kanRedigere: boolean;
    onError: (error: ApiError) => void;
    onSuccess: (message: string) => void;
    oppdaterLokaltNotat: (oppdatering: NotatOppdatering) => void;
};

const oppdaterEndretTidspunkt = (notat: NotatResponse): NotatResponse => ({
    ...notat,
    endret: new Date().toISOString(),
});

export const useNotatVedlegg = (props: Props) => {
    const [notatMedVedleggStatus, hentNotatMedVedlegg, resetNotatMedVedlegg] = useApiCall(
        (request: { sakId: string; notatId: string }) => notatApi.hentNotatMedVedlegg(request.sakId, request.notatId),
    );
    const [vedleggStatus, leggTilVedlegg, resetVedleggStatus] = useApiCall(notatApi.leggTilVedlegg);
    const [slettVedleggStatus, slettVedlegg, resetSlettVedleggStatus] = useApiCall(notatApi.slettVedlegg);
    const [visVedleggModal, setVisVedleggModal] = useState(false);
    const [valgtFil, setValgtFil] = useState<File | null>(null);

    useEffect(() => {
        setVisVedleggModal(false);
        setValgtFil(null);
        resetNotatMedVedlegg();
        resetVedleggStatus();
        resetSlettVedleggStatus();
    }, [props.sakId, props.notat?.id, resetNotatMedVedlegg, resetVedleggStatus, resetSlettVedleggStatus]);

    const notatMedVedlegg = RemoteData.isSuccess(notatMedVedleggStatus) ? notatMedVedleggStatus.value : null;
    const antallVedlegg = props.notat?.antallVedlegg ?? 0;
    const skalViseVedleggsknapp = props.kanRedigere || antallVedlegg > 0;

    const hentVedlegg = () => {
        if (!props.notat) {
            return;
        }

        hentNotatMedVedlegg({
            sakId: props.sakId,
            notatId: props.notat.id,
        });
    };

    const åpneVedleggModal = () => {
        if (!props.notat) {
            return;
        }

        setVisVedleggModal(true);
        hentVedlegg();
    };

    const lukkVedleggModal = () => {
        setVisVedleggModal(false);
        setValgtFil(null);
    };

    const handleLastOppVedlegg = () => {
        if (!props.notat || !valgtFil) {
            return;
        }

        leggTilVedlegg(
            {
                sakId: props.sakId,
                notatId: props.notat.id,
                filnavn: valgtFil.name,
                fil: valgtFil,
            },
            () => {
                props.oppdaterLokaltNotat((gjeldendeNotat) =>
                    oppdaterEndretTidspunkt({
                        ...gjeldendeNotat,
                        antallVedlegg: gjeldendeNotat.antallVedlegg + 1,
                    }),
                );
                setValgtFil(null);
                props.onSuccess('Vedlegg lastet opp');
                hentVedlegg();
            },
            props.onError,
        );
    };

    const handleSlettVedlegg = (vedleggId: string) => {
        if (!props.notat) {
            return;
        }

        slettVedlegg(
            {
                sakId: props.sakId,
                notatId: props.notat.id,
                vedleggId,
            },
            () => {
                props.oppdaterLokaltNotat((gjeldendeNotat) =>
                    oppdaterEndretTidspunkt({
                        ...gjeldendeNotat,
                        antallVedlegg: Math.max(0, gjeldendeNotat.antallVedlegg - 1),
                    }),
                );
                props.onSuccess('Vedlegg slettet');
                hentVedlegg();
            },
            props.onError,
        );
    };

    return {
        antallVedlegg,
        skalViseVedleggsknapp,
        onOpenVedlegg: åpneVedleggModal,
        vedleggModal: {
            open: visVedleggModal,
            kanRedigere: props.kanRedigere,
            valgtFil,
            vedlegg: notatMedVedlegg?.vedlegg ?? [],
            lasterVedlegg: RemoteData.isPending(notatMedVedleggStatus),
            lasterOppVedlegg: RemoteData.isPending(vedleggStatus),
            sletterVedlegg: RemoteData.isPending(slettVedleggStatus),
            vedleggError: RemoteData.isFailure(notatMedVedleggStatus) ? notatMedVedleggStatus.error : null,
            onClose: lukkVedleggModal,
            onSelectFile: setValgtFil,
            onUpload: handleLastOppVedlegg,
            onDelete: handleSlettVedlegg,
        },
    };
};
