import React from 'react';

import { OppsummeringPar, OppsummeringsParSortering } from '~src/components/oppsummeringspar/Oppsummeringsverdi';
import Beregningblokk from '~src/components/revurdering/oppsummering/beregningblokk/Beregningblokk';
import Oppsummeringspanel, {
    Oppsummeringsikon,
    Oppsummeringsfarge,
} from '~src/components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { useI18n } from '~src/lib/i18n';
import { UtbetalingsRevurdering } from '~src/types/Revurdering';

import messages from '../OppsummeringAvRevurderingsvedtak-nb';
import styles from '../OppsummeringAvRevurderingsvedtak.module.less';

const OppsummeringAvUtbetalingsrevurdering = (props: { revurdering: UtbetalingsRevurdering }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.utbetalingsrevurderingContainer}>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Liste}
                farge={Oppsummeringsfarge.Lilla}
                tittel={formatMessage('utbetalingsrevurdering.oppsummeringspanel.tittel')}
            >
                <div className={styles.oppsummeringspanelChildrenContainer}>
                    <OppsummeringPar
                        label={formatMessage('utbetalingsrevurdering.årsak')}
                        verdi={formatMessage(props.revurdering.årsak)}
                        sorteres={OppsummeringsParSortering.Vertikalt}
                    />
                    <OppsummeringPar
                        label={formatMessage('utbetalingsrevurdering.begrunnelse')}
                        verdi={props.revurdering.begrunnelse}
                        sorteres={OppsummeringsParSortering.Vertikalt}
                    />
                </div>
            </Oppsummeringspanel>
            <Beregningblokk revurdering={props.revurdering} />
        </div>
    );
};

export default OppsummeringAvUtbetalingsrevurdering;
