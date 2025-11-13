import Beregningblokk from '~src/components/oppsummering/oppsummeringAvRevurdering/beregningblokk/Beregningblokk';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { useI18n } from '~src/lib/i18n';
import { UtbetalingsRevurdering } from '~src/types/Revurdering';
import styles from './OppsummeringAvUtbetalingsrevurdering.module.less';
import messages from './OppsummeringAvUtbetalingsrevurdering-nb';

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
                        retning={'vertikal'}
                    />
                    <OppsummeringPar
                        label={formatMessage('utbetalingsrevurdering.begrunnelse')}
                        verdi={props.revurdering.begrunnelse}
                        retning={'vertikal'}
                    />
                </div>
            </Oppsummeringspanel>
            <Beregningblokk revurdering={props.revurdering} />
        </div>
    );
};

export default OppsummeringAvUtbetalingsrevurdering;
