import * as DateFns from 'date-fns';
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as Routes from '~src/lib/routes';
import { compareUtbetalingsperiode } from '~src/types/Utbetalingsperiode';
import { erInformasjonsRevurdering } from '~src/utils/revurdering/revurderingUtils';

import * as sharedStyles from '../revurdering.module.less';

import OppdaterRevurdering from './OppdaterRevurdering';
import OpprettRevurdering from './OpprettRevurdering';

const RevurderingIntroPage = () => {
    const { sak } = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.revurderingSeksjonSteg>();

    const informasjonsRevurdering = sak.revurderinger
        .filter(erInformasjonsRevurdering)
        .find((r) => r.id === urlParams.revurderingId);

    const sorterteUtbetalinger = [...sak.utbetalinger].sort(compareUtbetalingsperiode);
    const [førsteUtbetaling, sisteUtbetaling] = [
        sorterteUtbetalinger[0],
        sorterteUtbetalinger[sorterteUtbetalinger.length - 1],
    ];

    return (
        <div className={sharedStyles.revurderingContainer}>
            {informasjonsRevurdering ? (
                <OppdaterRevurdering
                    sakId={sak.id}
                    revurdering={informasjonsRevurdering}
                    minOgMaxPeriode={{
                        fraOgMed: DateFns.parseISO(førsteUtbetaling.fraOgMed),
                        tilOgMed: DateFns.parseISO(sisteUtbetaling.tilOgMed),
                    }}
                />
            ) : (
                <OpprettRevurdering
                    sakId={sak.id}
                    minOgMaxPeriode={{
                        fraOgMed: DateFns.parseISO(førsteUtbetaling.fraOgMed),
                        tilOgMed: DateFns.parseISO(sisteUtbetaling.tilOgMed),
                    }}
                />
            )}
        </div>
    );
};

export default RevurderingIntroPage;
