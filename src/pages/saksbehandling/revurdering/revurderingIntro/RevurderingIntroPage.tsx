import * as RemoteData from '@devexperts/remote-data-ts';
import * as DateFns from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';

import {
    oppdaterRevurderingsPeriode as oppdaterRevurdering,
    opprettRevurdering,
} from '~features/revurdering/revurderingActions';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { InformasjonSomRevurderes, InformasjonsRevurdering, OpprettetRevurderingGrunn } from '~types/Revurdering';
import { compareUtbetalingsperiode, Utbetalingsperiode } from '~types/Utbetalingsperiode';
import { finnNesteRevurderingsteg } from '~utils/revurdering/revurderingUtils';

import RevurderingIntroForm from './RevurderingIntroForm';

export interface FormValues {
    fraOgMed: Date;
    årsak: OpprettetRevurderingGrunn;
    informasjonSomRevurderes: InformasjonSomRevurderes[];
    begrunnelse: string;
}

const RevurderingIntroPage = (props: {
    sakId: string;
    utbetalinger: Utbetalingsperiode[];
    informasjonsRevurdering: InformasjonsRevurdering | undefined;
}) => {
    const oppdaterRevurderingStatus = useAppSelector((state) => state.sak.oppdaterRevurderingStatus);
    const opprettRevurderingStatus = useAppSelector((state) => state.sak.opprettRevurderingStatus);
    const status = RemoteData.combine(oppdaterRevurderingStatus, opprettRevurderingStatus);
    const history = useHistory();
    const dispatch = useAppDispatch();

    const forrigeUrl = Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId });
    const thunk = (arg: FormValues) =>
        props.informasjonsRevurdering
            ? oppdaterRevurdering({
                  sakId: props.sakId,
                  revurderingId: props.informasjonsRevurdering.id,
                  ...arg,
              })
            : opprettRevurdering({
                  sakId: props.sakId,
                  ...arg,
              });

    const endre = async (arg: FormValues, goTo: 'neste' | 'avbryt') => {
        const response = await dispatch(thunk(arg));
        if ((props.informasjonsRevurdering ? oppdaterRevurdering : opprettRevurdering).fulfilled.match(response)) {
            history.push(
                goTo === 'avbryt'
                    ? forrigeUrl
                    : Routes.revurderValgtRevurdering.createURL({
                          sakId: props.sakId,
                          revurderingId: response.payload.id,
                          steg: finnNesteRevurderingsteg(response.payload.informasjonSomRevurderes),
                      })
            );
        }
    };

    const sorterteUtbetalinger = [...props.utbetalinger].sort(compareUtbetalingsperiode);
    const [førsteUtbetaling, sisteUtbetaling] = [
        sorterteUtbetalinger[0],
        sorterteUtbetalinger[sorterteUtbetalinger.length - 1],
    ];

    return (
        <RevurderingIntroForm
            save={endre}
            tilbakeUrl={forrigeUrl}
            revurdering={props.informasjonsRevurdering}
            maxFraOgMed={DateFns.parseISO(sisteUtbetaling.tilOgMed)}
            minFraOgMed={DateFns.parseISO(førsteUtbetaling.fraOgMed)}
            nesteClickStatus={status}
            lagreOgFortsettSenereClickStatus={oppdaterRevurderingStatus}
        />
    );
};

export default RevurderingIntroPage;
