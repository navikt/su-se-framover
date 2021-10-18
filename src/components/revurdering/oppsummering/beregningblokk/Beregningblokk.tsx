import { Alert, BodyLong, Heading, Panel } from '@navikt/ds-react';
import * as React from 'react';

import VisBeregning from '~components/beregningOgSimulering/beregning/VisBeregning';
import { Utbetalingssimulering } from '~components/beregningOgSimulering/simulering/simulering';
import { useI18n } from '~lib/i18n';
import { harBeregninger, harSimulering, Revurdering, RevurderingsStatus } from '~types/Revurdering';
import { erGregulering, erRevurderingIngenEndring } from '~utils/revurdering/revurderingUtils';

import Oppsummeringspanel, { Oppsummeringsfarge, Oppsummeringsikon } from '../oppsummeringspanel/Oppsummeringspanel';

import messages from './beregningblokk-nb';
import styles from './beregningblokk.module.less';

const Beregningblokk = (props: { revurdering: Revurdering }) => {
    const { intl } = useI18n({ messages });

    const alert = React.useMemo(() => {
        if (erRevurderingIngenEndring(props.revurdering)) {
            return erGregulering(props.revurdering.årsak)
                ? {
                      tittel: intl.formatMessage({ id: 'revurdering.ingenEndring.gregulering.tittel' }),
                      tekst: intl.formatMessage({ id: 'revurdering.gregulering.ingenEndring' }),
                  }
                : {
                      tittel: intl.formatMessage({ id: 'revurdering.ingenEndring.tittel' }),
                      tekst: intl.formatMessage({ id: 'revurdering.ingenEndring' }),
                  };
        }
        if (props.revurdering.status === RevurderingsStatus.SIMULERT_OPPHØRT) {
            return {
                tittel: intl.formatMessage({ id: 'revurdering.opphør.advarsel.tittel' }),
                tekst: intl.formatMessage({ id: 'revurdering.opphør.advarsel' }),
            };
        }
        return null;
    }, [props.revurdering]);

    return (
        <Oppsummeringspanel
            tittel={intl.formatMessage({ id: 'heading' })}
            farge={Oppsummeringsfarge.Grønn}
            ikon={Oppsummeringsikon.Kalkulator}
        >
            {alert && (
                <Alert variant="info" className={styles.alert}>
                    <Heading level="3" size="small" spacing>
                        {alert.tittel}
                    </Heading>
                    <BodyLong>{alert.tekst}</BodyLong>
                </Alert>
            )}
            <div className={styles.container}>
                <div className={styles.column}>
                    <Heading level="3" size="small" spacing>
                        {intl.formatMessage({ id: 'heading.beregning' })}
                    </Heading>
                    <Panel border>
                        {harBeregninger(props.revurdering) ? (
                            <VisBeregning beregning={props.revurdering.beregninger.revurdert} utenTittel />
                        ) : (
                            intl.formatMessage({ id: 'error.ingenBeregning' })
                        )}
                    </Panel>
                </div>
                <div className={styles.column}>
                    <Heading level="3" size="small" spacing>
                        {intl.formatMessage({ id: 'heading.simulering' })}
                    </Heading>
                    <Panel border>
                        {harSimulering(props.revurdering) ? (
                            <Utbetalingssimulering simulering={props.revurdering.simulering} utenTittel />
                        ) : (
                            intl.formatMessage({ id: 'error.ingenSimulering' })
                        )}
                    </Panel>
                </div>
            </div>
        </Oppsummeringspanel>
    );
};

export default Beregningblokk;
