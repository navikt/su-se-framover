import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import { Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';

import RevurderingIngenEndringAlert from '~components/revurdering/RevurderingIngenEndringAlert';
import RevurderingÅrsakOgBegrunnelse from '~components/revurdering/RevurderingÅrsakOgBegrunnelse';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/hooks';
import VisBeregning from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/VisBeregning';
import {
    SimulertRevurdering,
    BeregnetIngenEndring,
    RevurderingsStatus,
    UnderkjentRevurdering,
    harSimulering,
} from '~types/Revurdering';

import { Utbetalingssimulering } from '../../steg/beregningOgSimulering/simulering/simulering';
import sharedStyles from '../revurdering.module.less';
import {
    erForhåndsvarslingBesluttet,
    erRevurderingForhåndsvarslet,
    erRevurderingIngenEndring,
    erRevurderingSimulert,
    erGregulering,
} from '../revurderingUtils';

import EtterForhåndsvarsel from './EtterForhåndsvarsel';
import Forhåndsvarsel from './Forhåndsvarsel';
import ForhåndsvarslingBesluttet from './ForhåndsvarslingBesluttet';
import GReguleringForOppsummering from './GReguleringForOppsummering';
import IngenEndring from './IngenEndring';
import messages from './revurderingOppsummering-nb';
import styles from './revurderingsOppsummering.module.less';

const RevurderingsOppsummering = (props: {
    sakId: string;
    revurdering: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering;
}) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });

    const OppsummeringsFormer = (r: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering) => {
        if (erGregulering(r.årsak)) {
            return <GReguleringForOppsummering sakId={props.sakId} revurdering={r} intl={intl} />;
        }

        if (erRevurderingIngenEndring(r)) {
            return <IngenEndring sakId={props.sakId} revurdering={r} intl={intl} />;
        }

        if (erRevurderingSimulert(r)) {
            if (erRevurderingForhåndsvarslet(r)) {
                if (erForhåndsvarslingBesluttet(r)) {
                    return <ForhåndsvarslingBesluttet sakId={props.sakId} revurdering={r} intl={intl} />;
                } else {
                    return <EtterForhåndsvarsel sakId={props.sakId} revurdering={r} intl={intl} />;
                }
            }
            return <Forhåndsvarsel sakId={props.sakId} revurdering={r} intl={intl} />;
        }

        return null;
    };

    return (
        <div className={sharedStyles.revurderingContainer}>
            <Innholdstittel className={sharedStyles.tittel}>
                {intl.formatMessage({ id: 'oppsummering.tittel' })}
            </Innholdstittel>
            <div className={sharedStyles.mainContentContainer}>
                {erRevurderingIngenEndring(props.revurdering) && !erGregulering(props.revurdering.årsak) && (
                    <RevurderingIngenEndringAlert className={styles.ingenEndringInfoboks} />
                )}
                <RevurderingÅrsakOgBegrunnelse
                    className={styles.årsakBegrunnelseContainer}
                    revurdering={props.revurdering}
                />
                <div className={styles.beregningContainer}>
                    <VisBeregning
                        beregningsTittel={intl.formatMessage({ id: 'oppsummering.gammelBeregning.tittel' })}
                        beregning={props.revurdering.beregninger.beregning}
                    />

                    <VisBeregning
                        beregningsTittel={intl.formatMessage({ id: 'oppsummering.nyBeregning.tittel' })}
                        beregning={props.revurdering.beregninger.revurdert}
                    />

                    {harSimulering(props.revurdering) && (
                        <Utbetalingssimulering simulering={props.revurdering.simulering} />
                    )}
                </div>
                {props.revurdering.status === RevurderingsStatus.SIMULERT_OPPHØRT && (
                    <div className={styles.opphørsadvarsel}>
                        <AlertStripeAdvarsel>
                            {intl.formatMessage({ id: 'revurdering.opphør.advarsel' })}
                        </AlertStripeAdvarsel>
                    </div>
                )}

                {OppsummeringsFormer(props.revurdering)}
            </div>
        </div>
    );
};

export default RevurderingsOppsummering;
