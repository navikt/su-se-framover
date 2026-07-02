import * as RemoteData from '@devexperts/remote-data-ts';
import { useEffect, useState } from 'react';
import { ApiError } from '~src/api/apiClient';
import * as notatApi from '~src/api/notatApi';
import { useApiCall } from '~src/lib/hooks';
import { NotatResponse } from '~src/types/Notat';

import { NotatOppdatering, TekstModalType } from './notatPanelTypes';

type Props = {
    sakId: string;
    notat: NotatResponse | null;
    underAttestering: boolean;
    kanRedigere: boolean;
    onError: (error: ApiError) => void;
    onSuccess: (message: string) => void;
    oppdaterLokaltNotat: (oppdatering: NotatOppdatering) => void;
};

const oppdaterEndretTidspunkt = (notat: NotatResponse): NotatResponse => ({
    ...notat,
    endret: new Date().toISOString(),
});

export const useNotatEditor = (props: Props) => {
    const [lagreSaksbehandlerStatus, lagreSaksbehandlerNotat, resetLagreSaksbehandlerStatus] = useApiCall(
        notatApi.oppdaterNotatSomSaksbehandler,
    );
    const [lagreAttestantStatus, lagreAttestantNotat, resetLagreAttestantStatus] = useApiCall(
        notatApi.oppdaterNotatSomAttestant,
    );
    const [åpenTekstModal, setÅpenTekstModal] = useState<TekstModalType | null>(null);
    const [notatTekst, setNotatTekst] = useState('');

    useEffect(() => {
        setÅpenTekstModal(null);
        setNotatTekst('');
        resetLagreSaksbehandlerStatus();
        resetLagreAttestantStatus();
    }, [props.sakId, props.notat?.id, resetLagreSaksbehandlerStatus, resetLagreAttestantStatus]);

    const harAttestantNotat = (props.notat?.attestantNotat ?? '').length > 0;
    const kanRedigereSaksbehandlernotat = props.kanRedigere && !props.underAttestering;
    const kanRedigereAttestantnotat = props.kanRedigere && props.underAttestering;
    const aktivTekstModal = åpenTekstModal ?? 'saksbehandler';
    const kanRedigereAktivtModalfelt =
        aktivTekstModal === 'attestant' ? kanRedigereAttestantnotat : kanRedigereSaksbehandlernotat;

    const åpneTekstModal = (type: TekstModalType) => {
        if (!props.notat) {
            return;
        }

        setNotatTekst(type === 'attestant' ? props.notat.attestantNotat : props.notat.notat);
        setÅpenTekstModal(type);
    };

    const lukkTekstModal = () => {
        setÅpenTekstModal(null);
        setNotatTekst('');
    };

    const handleLagreNotat = () => {
        if (!props.notat || !åpenTekstModal) {
            return;
        }

        if (åpenTekstModal === 'attestant') {
            lagreAttestantNotat(
                {
                    sakId: props.sakId,
                    notatId: props.notat.id,
                    notat: notatTekst,
                },
                () => {
                    props.oppdaterLokaltNotat((gjeldendeNotat) =>
                        oppdaterEndretTidspunkt({
                            ...gjeldendeNotat,
                            attestantNotat: notatTekst,
                        }),
                    );
                    props.onSuccess('Attestantnotat lagret');
                    lukkTekstModal();
                },
                props.onError,
            );
            return;
        }

        lagreSaksbehandlerNotat(
            {
                sakId: props.sakId,
                notatId: props.notat.id,
                notat: notatTekst,
            },
            () => {
                props.oppdaterLokaltNotat((gjeldendeNotat) =>
                    oppdaterEndretTidspunkt({
                        ...gjeldendeNotat,
                        notat: notatTekst,
                    }),
                );
                props.onSuccess('Saksbehandlernotat lagret');
                lukkTekstModal();
            },
            props.onError,
        );
    };

    return {
        harAttestantNotat,
        kanRedigereSaksbehandlernotat,
        kanRedigereAttestantnotat,
        onOpenSaksbehandler: () => åpneTekstModal('saksbehandler'),
        onOpenAttestant: () => åpneTekstModal('attestant'),
        tekstModal: {
            open: åpenTekstModal !== null,
            editorType: aktivTekstModal,
            kanRedigere: kanRedigereAktivtModalfelt,
            notatTekst,
            lagrer: RemoteData.isPending(lagreSaksbehandlerStatus) || RemoteData.isPending(lagreAttestantStatus),
            onClose: lukkTekstModal,
            onNotatTekstChange: setNotatTekst,
            onSave: handleLagreNotat,
        },
    };
};
