import * as DateFns from 'date-fns';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { opprettRevurdering, oppdaterRevurderingsPeriode } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import {
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    OpprettetRevurderingGrunn,
    Revurdering,
} from '~src/types/Revurdering';
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
    const navigate = useNavigate();
    const { sak } = useOutletContext<AttesteringContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.revurderValgtRevurdering>();

    const props = {
        sakId: sak.id,
        utbetalinger: sak.utbetalinger,
        informasjonsRevurderinger: sak.revurderinger.filter(erInformasjonsRevurdering),
    };
    const informasjonsRevurdering = props.informasjonsRevurderinger.find((r) => r.id === urlParams.revurderingId);

    const [opprettStatus, opprett] = useAsyncActionCreator(opprettRevurdering);
    const [oppdaterStatus, oppdater] = useAsyncActionCreator(oppdaterRevurderingsPeriode);

    const forrigeUrl = Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId });
    const thunk = (arg: FormValues, goTo: 'neste' | 'avbryt') =>
        informasjonsRevurdering
            ? oppdater(
                  {
                      sakId: props.sakId,
                      revurderingId: informasjonsRevurdering.id,
                      ...arg,
                  },
                  (revurdering) => navigateLocal(revurdering, goTo)
              )
            : opprett(
                  {
                      sakId: props.sakId,
                      ...arg,
                  },
                  (revurdering) => navigateLocal(revurdering, goTo)
              );

    const navigateLocal = (revurdering: Revurdering, goTo: 'neste' | 'avbryt') => {
        navigate(
            goTo === 'avbryt'
                ? forrigeUrl
                : Routes.revurderValgtRevurdering.createURL({
                      sakId: props.sakId,
                      revurderingId: revurdering.id,
                      steg: finnNesteRevurderingsteg((revurdering as InformasjonsRevurdering).informasjonSomRevurderes),
                  })
        );
    };

    const endre = async (arg: FormValues, goTo: 'neste' | 'avbryt') => await thunk(arg, goTo);

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
            opprettRevurderingStatus={opprettStatus}
            oppdaterRevurderingStatus={oppdaterStatus}
        />
    );
};

export default RevurderingIntroPage;
