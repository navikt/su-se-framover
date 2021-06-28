import * as DateFns from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { opprettRevurdering } from '~features/revurdering/revurderingActions';
import { finnNesteRevurderingsteg } from '~features/revurdering/revurderingUtils';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { InformasjonSomRevurderes, OpprettetRevurderingGrunn } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { compareUtbetalingsperiode } from '~types/Utbetalingsperiode';

import RevurderingIntroForm from './RevurderingIntroForm';

const NyRevurderingPage = (props: { sak: Sak }) => {
    const opprettRevurderingStatus = useAppSelector((state) => state.sak.opprettRevurderingStatus);
    const history = useHistory();

    const dispatch = useAppDispatch();
    const handleNesteClick = async (arg: {
        fraOgMed: Date;
        årsak: OpprettetRevurderingGrunn;
        informasjonSomRevurderes: InformasjonSomRevurderes[];
        begrunnelse: string;
    }) => {
        const response = await dispatch(
            opprettRevurdering({
                sakId: props.sak.id,
                ...arg,
            })
        );

        if (opprettRevurdering.fulfilled.match(response)) {
            history.push(
                Routes.revurderValgtRevurdering.createURL({
                    sakId: props.sak.id,
                    revurderingId: response.payload.id,
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
            opprettRevurdering({
                sakId: props.sak.id,
                ...arg,
            })
        );

        if (opprettRevurdering.fulfilled.match(response)) {
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
            revurdering={undefined}
            maxFraOgMed={DateFns.parseISO(sisteUtbetaling.tilOgMed)}
            minFraOgMed={DateFns.parseISO(førsteUtbetaling.fraOgMed)}
            nesteClickStatus={opprettRevurderingStatus}
            lagreOgFortsettSenereClickStatus={opprettRevurderingStatus}
        />
    );
};

export default NyRevurderingPage;
