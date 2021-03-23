import * as DateFns from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { opprettRevurdering } from '~features/revurdering/revurderingActions';
import { startenPåNesteMåned } from '~lib/dateUtils';
import * as Routes from '~lib/routes';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { OpprettetRevurderingGrunn } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { compareUtbetalingsperiode } from '~types/Utbetalingsperiode';

import RevurderingIntro from './RevurderingIntroForm';

export const NyRevurderingPage = (props: { sak: Sak }) => {
    const opprettRevurderingStatus = useAppSelector((state) => state.sak.opprettRevurderingStatus);
    const history = useHistory();

    const dispatch = useAppDispatch();
    const handleNesteClick = async (fraOgMed: Date, årsak: OpprettetRevurderingGrunn, begrunnelse: string) => {
        const response = await dispatch(
            opprettRevurdering({
                sakId: props.sak.id,
                fraOgMed,
                årsak: årsak,
                begrunnelse: begrunnelse,
            })
        );

        if (opprettRevurdering.fulfilled.match(response)) {
            history.push(
                Routes.revurderValgtRevurdering.createURL({
                    sakId: props.sak.id,
                    steg: RevurderingSteg.EndringAvFradrag,
                    revurderingId: response.payload.id,
                })
            );
        }
    };

    const sortertUtbetalingsperioder = [...props.sak.utbetalinger].sort(compareUtbetalingsperiode);
    const sisteUtbetalingsDato = new Date(sortertUtbetalingsperioder[sortertUtbetalingsperioder.length - 1].tilOgMed);

    const minFraOgMed = DateFns.max([new Date(props.sak.utbetalinger[0].fraOgMed), startenPåNesteMåned(new Date())]);

    return (
        <RevurderingIntro
            onNesteClick={handleNesteClick}
            avbrytUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}
            revurdering={undefined}
            maxFraOgMed={sisteUtbetalingsDato}
            minFraOgMed={minFraOgMed}
            nesteClickStatus={opprettRevurderingStatus}
        />
    );
};
