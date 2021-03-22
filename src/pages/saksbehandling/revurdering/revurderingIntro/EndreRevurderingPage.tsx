import * as DateFns from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { oppdaterRevurderingsPeriode as oppdaterRevurdering } from '~features/revurdering/revurderingActions';
import { startenPåNesteMåned as førsteINesteMåned } from '~lib/dateUtils';
import * as Routes from '~lib/routes';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { OpprettetRevurderingGrunn, Revurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { compareUtbetalingsperiode } from '~types/Utbetalingsperiode';

import RevurderingIntro from './RevurderingIntroForm';

export const EndreRevurderingPage = (props: { sak: Sak; revurdering: Revurdering }) => {
    const opprettRevurderingStatus = useAppSelector((state) => state.sak.opprettRevurderingStatus);
    const history = useHistory();

    const dispatch = useAppDispatch();
    const handleNesteClick = async (fraOgMed: Date, årsak: OpprettetRevurderingGrunn, begrunnelse: string) => {
        const response = await dispatch(
            oppdaterRevurdering({
                sakId: props.sak.id,
                revurderingId: props.revurdering.id,
                fraOgMed: fraOgMed,
                årsak: årsak,
                begrunnelse: begrunnelse,
            })
        );
        if (oppdaterRevurdering.fulfilled.match(response)) {
            history.push(
                Routes.revurderValgtRevurdering.createURL({
                    sakId: props.sak.id,
                    steg: RevurderingSteg.EndringAvFradrag,
                    revurderingId: response.payload.id,
                })
            );
        }
    };

    const sortertUtbetalinger = [...props.sak.utbetalinger].sort(compareUtbetalingsperiode);
    const [førsteUtbetaling, sisteUtbetaling] = [
        sortertUtbetalinger[0],
        sortertUtbetalinger[sortertUtbetalinger.length - 1],
    ];

    const minFraOgMed = DateFns.max([new Date(førsteUtbetaling.fraOgMed), førsteINesteMåned(new Date())]);
    const maxFraOgMed = new Date(sisteUtbetaling.tilOgMed);

    return (
        <RevurderingIntro
            onNesteClick={handleNesteClick}
            avbrytUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}
            revurdering={props.revurdering}
            maxFraOgMed={maxFraOgMed}
            minFraOgMed={minFraOgMed}
            nesteClickStatus={opprettRevurderingStatus}
        />
    );
};
