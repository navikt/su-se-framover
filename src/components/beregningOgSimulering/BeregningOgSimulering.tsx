import { Heading, Panel } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { Beregning } from '~src/types/Beregning';
import { Simulering } from '~src/types/Simulering';

import { OppsummeringPar, OppsummeringsParSortering } from '../oppsummeringspar/Oppsummeringsverdi';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '../revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';

import VisBeregning from './beregning/VisBeregning';
import bosSimulering from './BeregningOgSimulering-nb';
import * as styles from './beregningOgSimulering.module.less';
import { Utbetalingssimulering } from './simulering/simulering';

const BeregningOgSimulering = (props: {
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    tittel?: string;
    childrenOverBeregning?: React.ReactNode;
    childrenUnderBeregning?: React.ReactNode;
}) => {
    const { formatMessage } = useI18n({ messages: bosSimulering });
    return (
        <Oppsummeringspanel
            tittel={props.tittel ?? formatMessage('heading')}
            farge={Oppsummeringsfarge.Grønn}
            ikon={Oppsummeringsikon.Kalkulator}
        >
            {props.childrenOverBeregning && props.childrenOverBeregning}
            <div className={styles.container}>
                <div className={styles.column}>
                    <Heading level="3" size="small" spacing>
                        {formatMessage('heading.beregning')}
                    </Heading>
                    <Panel border>
                        {props.beregning ? (
                            <VisBeregning beregning={props.beregning} utenTittel />
                        ) : (
                            formatMessage('error.ingenBeregning')
                        )}
                    </Panel>
                </div>
                <div className={styles.column}>
                    <Heading level="3" size="small" spacing>
                        {formatMessage('heading.simulering')}
                    </Heading>
                    <Panel border>
                        {props.simulering ? (
                            <Utbetalingssimulering simulering={props.simulering} utenTittel />
                        ) : (
                            formatMessage('error.ingenSimulering')
                        )}
                    </Panel>
                </div>
            </div>
            {props.beregning?.begrunnelse && (
                <div className={styles.begrunnelseContainer}>
                    <OppsummeringPar
                        label={formatMessage('beregning.begrunnelse')}
                        verdi={props.beregning.begrunnelse}
                        sorteres={OppsummeringsParSortering.Vertikalt}
                    />
                </div>
            )}
            {props.childrenUnderBeregning && props.childrenUnderBeregning}
        </Oppsummeringspanel>
    );
};

export default BeregningOgSimulering;
