import * as DateFns from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { oppdaterRevurderingsPeriode as oppdaterRevurdering } from '~features/revurdering/revurderingActions';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { InformasjonSomRevurderes, OpprettetRevurderingGrunn, Revurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { compareUtbetalingsperiode } from '~types/Utbetalingsperiode';

import { finnNesteRevurderingsteg } from '../revurderingUtils';

import RevurderingIntroForm from './RevurderingIntroForm';

export const EndreRevurderingPage = (props: { sak: Sak; revurdering: Revurdering }) => {
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
            history.push(
                Routes.revurderValgtRevurdering.createURL({
                    sakId: props.sak.id,
                    revurderingId: props.revurdering.id,
                    steg: finnNesteRevurderingsteg(response.payload.informasjonSomRevurderes),
                })
            );
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

    const sorterteUtbetalinger = [...props.sak.utbetalinger].sort(compareUtbetalingsperiode);
    const [førsteUtbetaling, sisteUtbetaling] = [
        sorterteUtbetalinger[0],
        sorterteUtbetalinger[sorterteUtbetalinger.length - 1],
    ];

    return (
        <RevurderingIntroForm
            onNesteClick={handleNesteClick}
            onLagreOgFortsettSenereClick={handleLagreOgFortsettSenereClick}
            tilbakeUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}
            revurdering={props.revurdering}
            maxFraOgMed={DateFns.parseISO(sisteUtbetaling.tilOgMed)}
            minFraOgMed={DateFns.parseISO(førsteUtbetaling.fraOgMed)}
            nesteClickStatus={oppdaterRevurderingStatus}
            lagreOgFortsettSenereClickStatus={oppdaterRevurderingStatus}
        />
    );
};
