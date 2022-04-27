import * as DateFns from 'date-fns';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import {
    oppdaterRevurderingsPeriode as oppdaterRevurdering,
    opprettRevurdering,
} from '~src/features/revurdering/revurderingActions';
import * as Routes from '~src/lib/routes';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { InformasjonSomRevurderes, OpprettetRevurderingGrunn } from '~src/types/Revurdering';
import { compareUtbetalingsperiode } from '~src/types/Utbetalingsperiode';
import { erInformasjonsRevurdering, finnNesteRevurderingsteg } from '~src/utils/revurdering/revurderingUtils';
import { AttesteringContext } from '~src/utils/router/routerUtils';

import RevurderingIntroForm from './RevurderingIntroForm';

export interface FormValues {
    fraOgMed: Date;
    årsak: OpprettetRevurderingGrunn;
    informasjonSomRevurderes: InformasjonSomRevurderes[];
    begrunnelse: string;
}

const RevurderingIntroPage = () => {
    const { sak } = useOutletContext<AttesteringContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.revurderValgtRevurdering>();

    const props = {
        sakId: sak.id,
        utbetalinger: sak.utbetalinger,
        informasjonsRevurderinger: sak.revurderinger.filter(erInformasjonsRevurdering), //TODO: Skal passe for begge
    };
    const informasjonsRevurdering = props.informasjonsRevurderinger.find((r) => r.id === urlParams.revurderingId);
    const oppdaterRevurderingStatus = useAppSelector((state) => state.sak.oppdaterRevurderingStatus);
    const opprettRevurderingStatus = useAppSelector((state) => state.sak.opprettRevurderingStatus);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const forrigeUrl = Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId });
    const thunk = (arg: FormValues) =>
        informasjonsRevurdering
            ? oppdaterRevurdering({
                  sakId: props.sakId,
                  revurderingId: informasjonsRevurdering.id,
                  ...arg,
              })
            : opprettRevurdering({
                  sakId: props.sakId,
                  ...arg,
              });

    const endre = async (arg: FormValues, goTo: 'neste' | 'avbryt') => {
        const response = await dispatch(thunk(arg));
        if ((informasjonsRevurdering ? oppdaterRevurdering : opprettRevurdering).fulfilled.match(response)) {
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
            revurdering={informasjonsRevurdering}
            maxFraOgMed={DateFns.parseISO(sisteUtbetaling.tilOgMed)}
            minFraOgMed={DateFns.parseISO(førsteUtbetaling.fraOgMed)}
            opprettRevurderingStatus={opprettRevurderingStatus}
            oppdaterRevurderingStatus={oppdaterRevurderingStatus}
        />
    );
};

export default RevurderingIntroPage;
