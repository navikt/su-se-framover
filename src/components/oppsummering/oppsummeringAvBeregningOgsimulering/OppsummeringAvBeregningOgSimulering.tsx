import { Heading, Panel } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { Beregning } from '~src/types/Beregning';
import { Simulering } from '~src/types/Simulering';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import OppsummeringAvBeregning from './oppsummeringAvBeregning/OppsummeringAvBeregning';
import messages from './OppsummeringAvBeregningOgSimulering-nb';
import * as styles from './OppsummeringAvBeregningOgSimulering.module.less';
import { Utbetalingssimulering } from './oppsummeringAvSimulering/OppsummeringAvSimulering';

const OppsummeringAvBeregningOgSimulering = (props: {
    sakId: string;
    behandlingId: string;
    harSkattegrunnlag: boolean;
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    tittel?: string;
    kompakt?: boolean;
    childrenOverBeregning?: React.ReactNode;
    childrenUnderBeregning?: React.ReactNode;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Oppsummeringspanel
            tittel={props.tittel ?? formatMessage('heading')}
            farge={Oppsummeringsfarge.Grønn}
            ikon={Oppsummeringsikon.Kalkulator}
        >
            {props.childrenOverBeregning && props.childrenOverBeregning}
            <div
                className={classNames({
                    [styles.container]: true,
                    [styles.kompakt]: props.kompakt,
                })}
            >
                <div className={styles.column}>
                    <Heading level="3" size="small" spacing>
                        {formatMessage('heading.beregning')}
                    </Heading>
                    <Panel border>
                        {props.beregning ? (
                            <OppsummeringAvBeregning
                                sakId={props.sakId}
                                behandlingId={props.behandlingId}
                                beregning={props.beregning}
                                harSkattegrunnlag={props.harSkattegrunnlag}
                                utenTittel
                            />
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
                        retning={'vertikal'}
                    />
                </div>
            )}
            {props.childrenUnderBeregning && props.childrenUnderBeregning}
        </Oppsummeringspanel>
    );
};

export default OppsummeringAvBeregningOgSimulering;
