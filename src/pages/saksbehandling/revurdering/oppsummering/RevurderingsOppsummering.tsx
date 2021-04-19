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
} from '~types/Revurdering';

import sharedStyles from '../revurdering.module.less';
import { erRevurderingForhåndsvarslet, erRevurderingIngenEndring, erRevurderingSimulert } from '../revurderingUtils';

import EtterForhåndsvarsel from './EtterForhåndsvarsel';
import Forhåndsvarsel from './Forhåndsvarsel';
import IngenEndring from './IngenEndring';
import messages from './revurderingOppsummering-nb';
import styles from './revurderingsOppsummering.module.less';

const RevurderingsOppsummering = (props: {
    sakId: string;
    revurdering: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering;
}) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });

    return (
        <div className={sharedStyles.revurderingContainer}>
            <Innholdstittel className={sharedStyles.tittel}>
                {intl.formatMessage({ id: 'oppsummering.tittel' })}
            </Innholdstittel>
            <div className={sharedStyles.mainContentContainer}>
                {erRevurderingIngenEndring(props.revurdering) && (
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
                </div>
                {props.revurdering.status === RevurderingsStatus.SIMULERT_OPPHØRT && (
                    <div className={styles.opphørsadvarsel}>
                        <AlertStripeAdvarsel>
                            {intl.formatMessage({ id: 'revurdering.opphør.advarsel' })}
                        </AlertStripeAdvarsel>
                    </div>
                )}
                {erRevurderingIngenEndring(props.revurdering) && (
                    <IngenEndring sakId={props.sakId} revurdering={props.revurdering} intl={intl} />
                )}

                {erRevurderingSimulert(props.revurdering) &&
                    (erRevurderingForhåndsvarslet(props.revurdering) ? (
                        <EtterForhåndsvarsel revurdering={props.revurdering} intl={intl} />
                    ) : (
                        <Forhåndsvarsel sakId={props.sakId} revurdering={props.revurdering} intl={intl} />
                    ))}
            </div>
        </div>
    );
};

export default RevurderingsOppsummering;
