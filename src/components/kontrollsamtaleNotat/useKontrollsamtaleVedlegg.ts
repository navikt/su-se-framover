import * as RemoteData from '@devexperts/remote-data-ts';
import { useCallback, useEffect, useState } from 'react';
import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi.ts';
import { useApiCall } from '~src/lib/hooks.ts';

type Props = {
    sakId?: string;
    kontrollsamtaleId?: string;
};

export const useKontrollsamtaleVedlegg = (props: Props) => {
    const [hentVedleggStatus, hentVedlegg] = useApiCall(kontrollsamtaleApi.hentKontrollsamtaleVedlegg);
    const [leggTilVedleggStatus, leggTilVedlegg] = useApiCall(kontrollsamtaleApi.leggTilKontrollsamtaleVedlegg);
    const [slettVedleggStatus, slettVedlegg] = useApiCall(kontrollsamtaleApi.slettKontrollsamtaleVedlegg);
    const [visVedleggModal, setVisVedleggModal] = useState(false);
    const [valgtFil, setValgtFil] = useState<File | null>(null);
    const [navnPåUtklipp, setNavnPåUtklipp] = useState('');
    const [feilNavnPåUtklipp, setFeilNavnPåUtklipp] = useState<string | null>(null);

    const fetchVedlegg = useCallback(() => {
        if (!props.sakId || !props.kontrollsamtaleId) {
            return;
        }
        hentVedlegg({
            sakId: props.sakId,
            kontrollsamtaleId: props.kontrollsamtaleId,
        });
    }, [props.sakId, props.kontrollsamtaleId, hentVedlegg]);

    useEffect(() => {
        fetchVedlegg();
    }, [fetchVedlegg]);

    useEffect(() => {
        if (!RemoteData.isSuccess(leggTilVedleggStatus)) {
            return;
        }
        setValgtFil(null);
        fetchVedlegg();
    }, [leggTilVedleggStatus, fetchVedlegg]);

    useEffect(() => {
        if (!RemoteData.isSuccess(slettVedleggStatus)) {
            return;
        }
        fetchVedlegg();
    }, [slettVedleggStatus, fetchVedlegg]);

    const vedlegg = RemoteData.isSuccess(hentVedleggStatus) ? hentVedleggStatus.value : [];

    const åpneVedleggModal = () => {
        setVisVedleggModal(true);
        fetchVedlegg();
    };

    const lukkVedleggModal = () => {
        setVisVedleggModal(false);
        setValgtFil(null);
        setNavnPåUtklipp('');
        setFeilNavnPåUtklipp(null);
    };

    const handleLastOppVedlegg = (): void => {
        if (!valgtFil || !props.sakId || !props.kontrollsamtaleId) {
            return;
        }
        leggTilVedlegg({
            sakId: props.sakId,
            kontrollsamtaleId: props.kontrollsamtaleId,
            fil: valgtFil,
        });
    };

    const handleSlettVedlegg = (vedleggId: string): void => {
        if (!props.sakId || !props.kontrollsamtaleId) {
            return;
        }
        slettVedlegg({
            sakId: props.sakId,
            kontrollsamtaleId: props.kontrollsamtaleId,
            vedleggId,
        });
    };

    return {
        antallVedlegg: vedlegg.length,
        onOpenVedlegg: åpneVedleggModal,

        vedleggModal: {
            open: visVedleggModal,
            kanRedigere: true,
            valgtFil,
            vedlegg,

            lasterVedlegg: RemoteData.isPending(hentVedleggStatus),
            lasterOppVedlegg: RemoteData.isPending(leggTilVedleggStatus),
            sletterVedlegg: RemoteData.isPending(slettVedleggStatus),

            vedleggError: null,

            navnPåUtklipp,
            feilNavnPåUtklipp,

            onClose: lukkVedleggModal,
            onSelectFile: setValgtFil,
            onUpload: handleLastOppVedlegg,
            onDelete: handleSlettVedlegg,
            onNavnPåUtklippChange: setNavnPåUtklipp,
            onFeilNavnPåUtklippChange: setFeilNavnPåUtklipp,
        },
    };
};
