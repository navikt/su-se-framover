import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { Ingress, Normaltekst, Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';

import { useI18n } from '~lib/hooks';
import { harBeregninger, harSimulering, Revurdering, RevurderingsStatus } from '~types/Revurdering';

import VisBeregning from '../../../steg/beregningOgSimulering/beregning/VisBeregning';
import { Utbetalingssimulering } from '../../../steg/beregningOgSimulering/simulering/simulering';
import { erGregulering, erRevurderingIngenEndring } from '../../revurderingUtils';
import Oppsummeringspanel, { Oppsummeringsfarge, Oppsummeringsikon } from '../oppsummeringspanel/Oppsummeringspanel';

import messages from './beregningblokk-nb';
import styles from './beregningblokk.module.less';

const Beregningblokk = (props: { revurdering: Revurdering }) => {
    const intl = useI18n({ messages });

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
                <AlertStripeInfo className={styles.alert}>
                    <Undertittel className={styles.alertTittel}>{alert.tittel}</Undertittel>
                    <Normaltekst>{alert.tekst}</Normaltekst>
                </AlertStripeInfo>
            )}
            <div className={styles.container}>
                <div className={styles.column}>
                    <Ingress className={styles.tittel}>{intl.formatMessage({ id: 'heading.beregning' })}</Ingress>
                    <Panel border>
                        {harBeregninger(props.revurdering) ? (
                            <VisBeregning beregning={props.revurdering.beregninger.revurdert} utenTittel />
                        ) : (
                            intl.formatMessage({ id: 'error.ingenBeregning' })
                        )}
                    </Panel>
                </div>
                <div className={styles.column}>
                    <Ingress className={styles.tittel}>{intl.formatMessage({ id: 'heading.simulering' })}</Ingress>
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
