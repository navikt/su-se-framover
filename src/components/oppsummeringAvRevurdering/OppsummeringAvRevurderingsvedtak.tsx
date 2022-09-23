import React from 'react';

import { useI18n } from '~src/lib/i18n';
import RevurderingsoppsummeringWithSnapshot from '~src/pages/saksbehandling/vedtak/revurderingsvedtakWithSnapshot/RevurderingsoppsummeringWithSnapshot';
import { Sak } from '~src/types/Sak';
import { Vedtak } from '~src/types/Vedtak';
import { erInformasjonsRevurdering, erUtbetalingsrevurdering } from '~src/utils/revurdering/revurderingUtils';

import messages from './OppsummeringAvRevurderingsvedtak-nb';
import OppsummeringAvUtbetalingsrevurdering from './oppsummeringAvUtbetalingsrevurdering/OppsummeringAvUtbetalingsrevurdering';

const OppsummeringAvRevurderingsvedtak = (props: { sak: Sak; vedtak: Vedtak }) => {
    const { formatMessage } = useI18n({ messages });
    const revurdering = props.sak.revurderinger.find((r) => r.id === props.vedtak.behandlingId);

    if (!revurdering) {
        return <div>{formatMessage('oppsummeringAvRevurderingsvedtak.fantIkkeVedtak')}</div>;
    }

    return (
        <div>
            {erInformasjonsRevurdering(revurdering) && (
                <RevurderingsoppsummeringWithSnapshot
                    revurdering={revurdering}
                    sakId={props.sak.id}
                    vedtakId={props.vedtak.id}
                />
            )}
            {erUtbetalingsrevurdering(revurdering) && (
                <OppsummeringAvUtbetalingsrevurdering revurdering={revurdering} />
            )}
        </div>
    );
};

export default OppsummeringAvRevurderingsvedtak;
