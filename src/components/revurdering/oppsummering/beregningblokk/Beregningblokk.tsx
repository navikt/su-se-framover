import { Alert, BodyLong, Heading } from '@navikt/ds-react';
import * as React from 'react';

import BeregningOgSimulering from '~src/components/beregningOgSimulering/BeregningOgSimulering';
import simulertUtbetaling from '~src/components/beregningOgSimulering/simulering/simulering-nb';
import { useI18n } from '~src/lib/i18n';
import { Oppsummeringsfelt } from '~src/pages/søknad/steg/oppsummering/components/Oppsummeringsfelt';
import { InformasjonsRevurderingStatus, Revurdering, SimuleringForAvkortingsvarsel } from '~src/types/Revurdering';
import { formatPeriode } from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';
import { harBeregninger, harSimulering, hentAvkortingFraRevurdering } from '~src/utils/revurdering/revurderingUtils';

import messages from './beregningblokk-nb';
import * as styles from './beregningblokk.module.less';

const Beregningblokk = ({ revurdering }: { revurdering: Revurdering }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...simulertUtbetaling } });
    const simuleringForAvkortingsvarsel = hentAvkortingFraRevurdering(revurdering);

    const alert = React.useMemo(() => {
        if (revurdering.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT) {
            return simuleringForAvkortingsvarsel
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
        <BeregningOgSimulering
            beregning={harBeregninger(revurdering) ? revurdering.beregning : null}
            simulering={harSimulering(revurdering) ? revurdering.simulering : null}
            childrenOverBeregning={
                alert && (
                    <Alert variant="info" className={styles.alert}>
                        <Heading level="3" size="small" spacing>
                            {alert.tittel}
                        </Heading>
                        <BodyLong>{alert.tekst}</BodyLong>
                    </Alert>
                )
            }
            childrenUnderBeregning={
                simuleringForAvkortingsvarsel && <AvkortingRevurdering avkorting={simuleringForAvkortingsvarsel} />
            }
        />
    );
};

export const AvkortingRevurdering = (props: { avkorting: SimuleringForAvkortingsvarsel }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...simulertUtbetaling } });
    return (
        <div className={styles.avkorting}>
            <Heading level="3" size="small" spacing>
                {formatMessage('heading.avkorting')}
            </Heading>
            <div className={styles.avkortingContent}>
                <Oppsummeringsfelt
                    label={formatMessage('avkorting.total')}
                    verdi={formatCurrency(props.avkorting.totalOppsummering.sumFeilutbetaling)}
                />
                <ul className={styles.avkortingListe}>
                    {props.avkorting.periodeOppsummering.map((periode) => (
                        <li key={periode.fraOgMed}>
                            <p>
                                {formatPeriode({
                                    fraOgMed: periode.fraOgMed,
                                    tilOgMed: periode.tilOgMed,
                                })}
                            </p>
                            <p>{`${formatCurrency(periode.sumFeilutbetaling)} ${formatMessage('iMnd')}`}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Beregningblokk;
