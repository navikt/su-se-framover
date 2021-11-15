import * as DateFns from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { opprettRevurdering } from '~features/revurdering/revurderingActions';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { InformasjonSomRevurderes, OpprettetRevurderingGrunn } from '~types/Revurdering';
import { compareUtbetalingsperiode, Utbetalingsperiode } from '~types/Utbetalingsperiode';
import { finnNesteRevurderingsteg } from '~utils/revurdering/revurderingUtils';

import RevurderingIntroForm from './RevurderingIntroForm';

const NyRevurderingPage = (props: { sakId: string; utbetalinger: Utbetalingsperiode[] }) => {
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
                sakId: props.sakId,
                ...arg,
            })
        );

        if (opprettRevurdering.fulfilled.match(response)) {
            history.push(
                Routes.revurderValgtRevurdering.createURL({
                    sakId: props.sakId,
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
                sakId: props.sakId,
                ...arg,
            })
        );

        if (opprettRevurdering.fulfilled.match(response)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        }
    };

    const sorterteUtbetalinger = [...props.utbetalinger].sort(compareUtbetalingsperiode);
    const [førsteUtbetaling, sisteUtbetaling] = [
        sorterteUtbetalinger[0],
        sorterteUtbetalinger[sorterteUtbetalinger.length - 1],
    ];

    return (
        <RevurderingIntroForm
            onNesteClick={handleNesteClick}
            onLagreOgFortsettSenereClick={handleLagreOgFortsettSenereClick}
            tilbakeUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
            revurdering={undefined}
            maxFraOgMed={DateFns.parseISO(sisteUtbetaling.tilOgMed)}
            minFraOgMed={DateFns.parseISO(førsteUtbetaling.fraOgMed)}
            nesteClickStatus={opprettRevurderingStatus}
            lagreOgFortsettSenereClickStatus={opprettRevurderingStatus}
        />
    );
};

export default NyRevurderingPage;
