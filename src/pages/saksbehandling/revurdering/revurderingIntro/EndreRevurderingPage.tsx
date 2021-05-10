import * as DateFns from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { oppdaterRevurderingsPeriode as oppdaterRevurdering } from '~features/revurdering/revurderingActions';
import { startenPåForrigeMåned } from '~lib/dateUtils';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { InformasjonSomRevurderes, OpprettetRevurderingGrunn, Revurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { compareUtbetalingsperiode } from '~types/Utbetalingsperiode';

import RevurderingIntroForm from './RevurderingIntroForm';

export const EndreRevurderingPage = (props: { sak: Sak; revurdering: Revurdering; nesteUrl: string }) => {
    const oppdaterRevurderingStatus = useAppSelector((state) => state.sak.oppdaterRevurderingStatus);
    const history = useHistory();

    const dispatch = useAppDispatch();
    const handleNesteClick = async (arg: {
        fraOgMed: Date;
        årsak: OpprettetRevurderingGrunn;
        informasjonSomRevurderes: InformasjonSomRevurderes[];
        begrunnelse: string;
    }) => {
        const response = await dispatch(
            oppdaterRevurdering({
                sakId: props.sak.id,
                revurderingId: props.revurdering.id,
                ...arg,
            })
        );
        if (oppdaterRevurdering.fulfilled.match(response)) {
            history.push(props.nesteUrl);
        }
    };
    const handleLagreOgFortsettSenereClick = async (arg: {
        fraOgMed: Date;
        årsak: OpprettetRevurderingGrunn;
        informasjonSomRevurderes: InformasjonSomRevurderes[];
        begrunnelse: string;
    }) => {
        const response = await dispatch(
            oppdaterRevurdering({
                sakId: props.sak.id,
                revurderingId: props.revurdering.id,
                ...arg,
            })
        );

        if (oppdaterRevurdering.fulfilled.match(response)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id }));
        }
    };

    const sortertUtbetalinger = [...props.sak.utbetalinger].sort(compareUtbetalingsperiode);
    const [førsteUtbetaling, sisteUtbetaling] = [
        sortertUtbetalinger[0],
        sortertUtbetalinger[sortertUtbetalinger.length - 1],
    ];

    const minFraOgMed = DateFns.max([new Date(førsteUtbetaling.fraOgMed), startenPåForrigeMåned(new Date())]);
    const maxFraOgMed = new Date(sisteUtbetaling.tilOgMed);

    return (
        <RevurderingIntroForm
            onNesteClick={handleNesteClick}
            onLagreOgFortsettSenereClick={handleLagreOgFortsettSenereClick}
            tilbakeUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}
            revurdering={props.revurdering}
            maxFraOgMed={maxFraOgMed}
            minFraOgMed={minFraOgMed}
            nesteClickStatus={oppdaterRevurderingStatus}
            lagreOgFortsettSenereClickStatus={oppdaterRevurderingStatus}
        />
    );
};
