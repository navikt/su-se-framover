import * as DateFns from 'date-fns';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
    oppdaterRevurderingsPeriode as oppdaterRevurdering,
    opprettRevurdering,
} from '~src/features/revurdering/revurderingActions';
import * as Routes from '~src/lib/routes';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { InformasjonSomRevurderes, InformasjonsRevurdering, OpprettetRevurderingGrunn } from '~src/types/Revurdering';
import { compareUtbetalingsperiode, Utbetalingsperiode } from '~src/types/Utbetalingsperiode';
import { finnNesteRevurderingsteg } from '~src/utils/revurdering/revurderingUtils';

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

    const navigate = useNavigate();
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
            navigate(
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
            opprettRevurderingStatus={opprettRevurderingStatus}
            oppdaterRevurderingStatus={oppdaterRevurderingStatus}
        />
    );
};

export default RevurderingIntroPage;
