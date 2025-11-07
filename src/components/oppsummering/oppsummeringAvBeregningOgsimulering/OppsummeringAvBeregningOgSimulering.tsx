import { Heading, Panel } from '@navikt/ds-react';
import { ReactNode } from 'react';

import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { Beregning } from '~src/types/Beregning';
import { EksternGrunnlagSkatt } from '~src/types/EksterneGrunnlag';
import { Simulering } from '~src/types/Simulering';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import styles from './OppsummeringAvBeregningOgSimulering.module.less';
import messages from './OppsummeringAvBeregningOgSimulering-nb';
import OppsummeringAvBeregning from './oppsummeringAvBeregning/OppsummeringAvBeregning';
import { Utbetalingssimulering } from './oppsummeringAvSimulering/OppsummeringAvSimulering';

const OppsummeringAvBeregningOgSimulering = (props: {
    eksterngrunnlagSkatt: Nullable<EksternGrunnlagSkatt>;
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    tittel?: string;
    childrenOverBeregning?: ReactNode;
    childrenUnderBeregning?: ReactNode;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Oppsummeringspanel
            tittel={props.tittel ?? formatMessage('heading')}
            farge={Oppsummeringsfarge.Grønn}
            ikon={Oppsummeringsikon.Kalkulator}
        >
            {props.childrenOverBeregning && props.childrenOverBeregning}
            <div className={styles.container}>
                <div>
                    <Heading level="3" size="small" spacing>
                        {formatMessage('heading.beregning')}
                    </Heading>
                    <Panel border>
                        {props.beregning ? (
                            <OppsummeringAvBeregning
                                beregning={props.beregning}
                                eksternGrunnlagSkatt={props.eksterngrunnlagSkatt}
                                utenTittel
                            />
                        ) : (
                            formatMessage('error.ingenBeregning')
                        )}
                    </Panel>
                </div>
                <div>
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
