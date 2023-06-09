import * as DateFns from 'date-fns';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { opprettRevurdering, oppdaterRevurderingsPeriode } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import {
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    OpprettetRevurderingGrunn,
    Revurdering,
    RevurderingSeksjoner,
    RevurderingSteg,
} from '~src/types/Revurdering';
import { compareUtbetalingsperiode } from '~src/types/Utbetalingsperiode';
import { erInformasjonsRevurdering, lagVilkårOgGrunnlagSeksjon } from '~src/utils/revurdering/revurderingUtils';

import RevurderingIntroForm from './RevurderingIntroForm';

export interface FormValues {
    periode: {
        fraOgMed: Date;
        tilOgMed: Date;
    };
    årsak: OpprettetRevurderingGrunn;
    informasjonSomRevurderes: InformasjonSomRevurderes[];
    begrunnelse: string;
}

const RevurderingIntroPage = () => {
    const navigate = useNavigate();
    const { sak } = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.revurderingSeksjonSteg>();

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
        const grunnlagOgVilkårSeksjoner = lagVilkårOgGrunnlagSeksjon({
            sakId: props.sakId,
            r: revurdering as InformasjonsRevurdering,
        });

        navigate(
            goTo === 'avbryt'
                ? forrigeUrl
                : Routes.revurderingSeksjonSteg.createURL({
                      sakId: props.sakId,
                      revurderingId: revurdering.id,
                      seksjon: grunnlagOgVilkårSeksjoner.id as RevurderingSeksjoner,
                      steg: grunnlagOgVilkårSeksjoner.linjer[0].id as RevurderingSteg,
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
            periodeConfig={{
                minDate: DateFns.parseISO(førsteUtbetaling.fraOgMed),
                maxDate: DateFns.parseISO(sisteUtbetaling.tilOgMed),
            }}
            opprettRevurderingStatus={opprettStatus}
            oppdaterRevurderingStatus={oppdaterStatus}
        />
    );
};

export default RevurderingIntroPage;
