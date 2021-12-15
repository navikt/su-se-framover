import { Alert, BodyLong, Heading, Panel } from '@navikt/ds-react';
import * as React from 'react';

import VisBeregning from '~components/beregningOgSimulering/beregning/VisBeregning';
import { Utbetalingssimulering } from '~components/beregningOgSimulering/simulering/simulering';
import simulertUtbetaling from '~components/beregningOgSimulering/simulering/simulering-nb';
import { OppsummeringPar } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringspar';
import { useI18n } from '~lib/i18n';
import { InformasjonsRevurderingStatus, Revurdering } from '~types/Revurdering';
import { formatPeriode } from '~utils/date/dateUtils';
import { formatCurrency } from '~utils/format/formatUtils';
import {
    erGregulering,
    erRevurderingIngenEndring,
    erRevurderingSimulert,
    harBeregninger,
    harSimulering,
} from '~utils/revurdering/revurderingUtils';

import Oppsummeringspanel, { Oppsummeringsfarge, Oppsummeringsikon } from '../oppsummeringspanel/Oppsummeringspanel';

import messages from './beregningblokk-nb';
import styles from './beregningblokk.module.less';

const Beregningblokk = ({ revurdering }: { revurdering: Revurdering }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...simulertUtbetaling } });

    const alert = React.useMemo(() => {
        if (erRevurderingIngenEndring(revurdering)) {
            return erGregulering(revurdering.årsak)
                ? {
                      tittel: formatMessage('revurdering.ingenEndring.gregulering.tittel'),
                      tekst: formatMessage('revurdering.gregulering.ingenEndring'),
                  }
                : {
                      tittel: formatMessage('revurdering.ingenEndring.tittel'),
                      tekst: formatMessage('revurdering.ingenEndring'),
                  };
        }
        if (revurdering.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT) {
            return erRevurderingSimulert(revurdering) && revurdering.simuleringForAvkortingsvarsel
                ? {
                      tittel: formatMessage('revurdering.opphør.avkorting.advarsel.tittel'),
                      tekst: formatMessage('revurdering.opphør.avkorting.advarsel'),
                  }
                : {
                      tittel: formatMessage('revurdering.opphør.advarsel.tittel'),
                      tekst: formatMessage('revurdering.opphør.advarsel'),
                  };
        }
        return null;
    }, [revurdering]);

    return (
        <Oppsummeringspanel
            tittel={formatMessage('heading')}
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
                        {formatMessage('heading.beregning')}
                    </Heading>
                    <Panel border>
                        {harBeregninger(revurdering) ? (
                            <VisBeregning beregning={revurdering.beregning} utenTittel />
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
                        {harSimulering(revurdering) ? (
                            <Utbetalingssimulering simulering={revurdering.simulering} utenTittel />
                        ) : (
                            formatMessage('error.ingenSimulering')
                        )}
                    </Panel>
                </div>
            </div>
            {erRevurderingSimulert(revurdering) && revurdering.simuleringForAvkortingsvarsel && (
                <div className={styles.avkorting}>
                    <Heading level="3" size="small" spacing>
                        {formatMessage('heading.avkorting')}
                    </Heading>
                    <div className={styles.avkortingContent}>
                        <OppsummeringPar
                            label={formatMessage('avkorting.total')}
                            verdi={formatCurrency(revurdering.simuleringForAvkortingsvarsel.totalBruttoYtelse)}
                        />
                        <ul className={styles.avkortingListe}>
                            {revurdering.simuleringForAvkortingsvarsel.perioder.map((periode) => (
                                <li key={periode.fraOgMed}>
                                    <p>{formatPeriode({ fraOgMed: periode.fraOgMed, tilOgMed: periode.tilOgMed })}</p>
                                    <p>{formatMessage(periode.type)}</p>
                                    <p>{`${formatCurrency(periode.bruttoYtelse)} ${formatMessage('iMnd')}`}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </Oppsummeringspanel>
    );
};

export default Beregningblokk;
