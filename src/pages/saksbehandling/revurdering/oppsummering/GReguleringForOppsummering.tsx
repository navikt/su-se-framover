import * as RemoteData from '@devexperts/remote-data-ts';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router';

import { ApiError } from '~api/apiClient';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import * as Routes from '~lib/routes';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch } from '~redux/Store';
import {
    BeregnetIngenEndring,
    RevurderingTilAttestering,
    SimulertRevurdering,
    UnderkjentRevurdering,
} from '~types/Revurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';

const GReguleringForOppsummering = (props: {
    sakId: string;
    revurdering: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering;
    intl: IntlShape;
}) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [status, setStatus] = useState<RemoteData.RemoteData<ApiError | undefined, null | RevurderingTilAttestering>>(
        RemoteData.initial
    );

    const handleSubmit = async () => {
        setStatus(RemoteData.pending);

        const res = await dispatch(
            revurderingActions.sendRevurderingTilAttestering({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                fritekstTilBrev: '',
                skalFøreTilBrevutsending: false,
            })
        );

        if (revurderingActions.sendRevurderingTilAttestering.rejected.match(res)) {
            setStatus(RemoteData.failure(res.payload));
        }

        if (revurderingActions.sendRevurderingTilAttestering.fulfilled.match(res)) {
            setStatus(RemoteData.success(res.payload));

            history.push(
                Routes.createSakIntroLocation(
                    props.intl.formatMessage({ id: 'oppsummering.sendtTilAttestering' }),
                    props.sakId
                )
            );
        }
    };

    const forrigeURL = Routes.revurderValgtRevurdering.createURL({
        sakId: props.sakId,
        steg: RevurderingSteg.EndringAvFradrag,
        revurderingId: props.revurdering.id,
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            {RemoteData.isFailure(status) && <RevurderingskallFeilet error={status.error} />}

            <RevurderingBunnknapper
                onNesteClick={'submit'}
                nesteKnappTekst={props.intl.formatMessage({ id: 'knapp.sendTilAttestering' })}
                tilbakeUrl={forrigeURL}
                onNesteClickSpinner={RemoteData.isPending(status)}
            />
        </form>
    );
};

export default GReguleringForOppsummering;
