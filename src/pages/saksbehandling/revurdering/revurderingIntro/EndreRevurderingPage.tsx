import * as DateFns from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { oppdaterRevurderingsPeriode as oppdaterRevurdering } from '~features/revurdering/revurderingActions';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { InformasjonSomRevurderes, InformasjonsRevurdering, OpprettetRevurderingGrunn } from '~types/Revurdering';
import { compareUtbetalingsperiode, Utbetalingsperiode } from '~types/Utbetalingsperiode';
import { finnNesteRevurderingsteg } from '~utils/revurdering/revurderingUtils';

import RevurderingIntroForm from './RevurderingIntroForm';

const EndreRevurderingPage = (props: {
    sakId: string;
    utbetalinger: Utbetalingsperiode[];
    informasjonsRevurdering: InformasjonsRevurdering;
}) => {
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
                sakId: props.sakId,
                revurderingId: props.informasjonsRevurdering.id,
                ...arg,
            })
        );
        if (oppdaterRevurdering.fulfilled.match(response)) {
            history.push(
                Routes.revurderValgtRevurdering.createURL({
                    sakId: props.sakId,
                    revurderingId: props.informasjonsRevurdering.id,
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
                sakId: props.sakId,
                revurderingId: props.informasjonsRevurdering.id,
                ...arg,
            })
        );

        if (oppdaterRevurdering.fulfilled.match(response)) {
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
            revurdering={props.informasjonsRevurdering}
            maxFraOgMed={DateFns.parseISO(sisteUtbetaling.tilOgMed)}
            minFraOgMed={DateFns.parseISO(førsteUtbetaling.fraOgMed)}
            nesteClickStatus={oppdaterRevurderingStatus}
            lagreOgFortsettSenereClickStatus={oppdaterRevurderingStatus}
        />
    );
};

export default EndreRevurderingPage;
