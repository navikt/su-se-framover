import { Alert, BodyLong, Heading } from '@navikt/ds-react';
import { useMemo } from 'react';

import simulertUtbetaling from '~src/components/oppsummering/oppsummeringAvBeregningOgsimulering/oppsummeringAvSimulering/OppsummeringAvSimulering-nb';
import { useI18n } from '~src/lib/i18n';
import { InformasjonsRevurderingStatus, Revurdering } from '~src/types/Revurdering';
import { harBeregninger, harSimulering } from '~src/utils/revurdering/revurderingUtils';

import OppsummeringAvBeregningOgSimulering from '../../oppsummeringAvBeregningOgsimulering/OppsummeringAvBeregningOgSimulering';
import styles from './beregningblokk.module.less';
import messages from './beregningblokk-nb';

const Beregningblokk = ({ revurdering }: { revurdering: Revurdering }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...simulertUtbetaling } });

    const alert = useMemo(() => {
        if (revurdering.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT) {
            return {
                tittel: formatMessage('revurdering.opphør.advarsel.tittel'),
                tekst: formatMessage('revurdering.opphør.advarsel'),
            };
        }
        return null;
    }, [revurdering]);

    return (
        <OppsummeringAvBeregningOgSimulering
            eksterngrunnlagSkatt={null}
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
        />
    );
};

export default Beregningblokk;
