import * as RemoteData from '@devexperts/remote-data-ts';
import { useEffect, useState } from 'react';
import { ApiError } from '~src/api/apiClient';
import * as notatApi from '~src/api/notatApi';
import { useApiCall } from '~src/lib/hooks';
import { NotatResponse, OpprettNotatBody } from '~src/types/Notat';

import { NotatOppdatering, NotatPanelProps } from './notatPanelTypes';

type Props = NotatPanelProps & {
    clearFeedback: () => void;
    onError: (error: ApiError) => void;
    onSuccess: (message: string) => void;
};

export const useNotatHook = (props: Props) => {
    const [notatStatus, hentNotat, resetNotat] = useApiCall(notatApi.hentNotat);
    const [opprettStatus, opprettNotat, resetOpprettStatus] = useApiCall(
        (request: { sakId: string; body: OpprettNotatBody }) => notatApi.opprettNotat(request.sakId, request.body),
    );
    const [lokalNotat, setLokalNotat] = useState<NotatResponse | null>(null);

    useEffect(() => {
        resetNotat();
        resetOpprettStatus();
        props.clearFeedback();
        setLokalNotat(null);

        hentNotat(
            {
                sakId: props.sakId,
                referanseId: props.referanseId,
                referanseType: props.referanseType,
            },
            setLokalNotat,
        );
    }, [
        props.sakId,
        props.referanseId,
        props.referanseType,
        props.clearFeedback,
        hentNotat,
        resetNotat,
        resetOpprettStatus,
    ]);

    const handleOpprettNotat = () => {
        opprettNotat(
            {
                sakId: props.sakId,
                body: {
                    referanseId: props.referanseId,
                    referanseType: props.referanseType,
                },
            },
            (opprettetNotat) => {
                setLokalNotat({
                    ...opprettetNotat,
                    antallVedlegg: 0,
                });
                props.onSuccess('Notat opprettet');
            },
            props.onError,
        );
    };

    return {
        notat: lokalNotat,
        visLaster: RemoteData.isInitial(notatStatus) || RemoteData.isPending(notatStatus),
        notatError:
            RemoteData.isFailure(notatStatus) && notatStatus.error.statusCode !== 404 ? notatStatus.error : null,
        manglerNotat: lokalNotat === null && RemoteData.isSuccess(notatStatus) && notatStatus.value === null,
        oppretterNotat: RemoteData.isPending(opprettStatus),
        oppdaterLokaltNotat: (oppdatering: NotatOppdatering) =>
            setLokalNotat((gjeldendeNotat) => (gjeldendeNotat ? oppdatering(gjeldendeNotat) : gjeldendeNotat)),
        onOpprettNotat: handleOpprettNotat,
    };
};
