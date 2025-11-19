import { BodyShort, Button, Heading } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { SuccessIcon, WarningIcon } from '~src/assets/Icons';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { KanStansesEllerGjenopptas } from '~src/types/Sak';
import { sorterUtbetalingsperioder, Utbetalingsperiode } from '~src/types/Utbetalingsperiode';
import { formatMonthYear } from '~src/utils/date/dateUtils';

import messages from './sakintro-nb';
import styles from './utbetalinger.module.less';

const Utbetalingsperioder = (props: { utbetalingsperioder: Utbetalingsperiode[] }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <ol>
            {props.utbetalingsperioder.map((u) => (
                <li className={styles.utbetalingsperiode} key={`${u.fraOgMed}-${u.tilOgMed}-${u.type}`}>
                    <BodyShort>
                        {formatMonthYear(u.fraOgMed)} - {formatMonthYear(u.tilOgMed)}
                    </BodyShort>
                    <BodyShort>
                        {u.beløp} {formatMessage('utbetalinger.periode.beløp.kr')}
                    </BodyShort>
                    <BodyShort>{formatMessage(u.type)}</BodyShort>
                </li>
            ))}
        </ol>
    );
};

const Utbetalinger = (props: {
    sakId: string;
    utbetalingsperioder: Utbetalingsperiode[];
    kanStansesEllerGjenopptas: KanStansesEllerGjenopptas;
}) => {
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();
    const { utbetalingsperioder, kanStansesEllerGjenopptas } = props;

    if (utbetalingsperioder.length === 0) {
        return <div></div>;
    }

    const sortertUtbetalingsperioder = sorterUtbetalingsperioder(utbetalingsperioder);
    const førsteUtbetalingsperiode = new Date(sortertUtbetalingsperioder[0].fraOgMed);
    const sisteUtbetalingsDato = new Date(sortertUtbetalingsperioder[sortertUtbetalingsperioder.length - 1].tilOgMed);

    // TODO jah: Vi skal legge til dette per utbetalingslinje i backend, slik at den følger den faktiske implementasjonen
    // Tidligste utbetaling må være etter eller lik den første neste måned (nåværende backend impl).
    const kanStanses =
        kanStansesEllerGjenopptas === KanStansesEllerGjenopptas.STANS &&
        utbetalingsperioder.some(
            (u) =>
                !DateFns.isBefore(DateFns.parseISO(u.tilOgMed), DateFns.startOfMonth(DateFns.addMonths(new Date(), 1))),
        );
    const kanGjenopptas = kanStansesEllerGjenopptas === KanStansesEllerGjenopptas.GJENOPPTA;

    const erStønadsperiodeUtløpt = DateFns.isAfter(new Date(), sisteUtbetalingsDato);

    return (
        <div className={styles.utbetalingContainer}>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Lommebok}
                farge={Oppsummeringsfarge.Limegrønn}
                tittel={formatMessage('utbetalinger.heading')}
            >
                <div className={styles.stønadsperiodeHeader}>
                    <Heading level="3" size="small">
                        {formatMonthYear(førsteUtbetalingsperiode)} - {formatMonthYear(sisteUtbetalingsDato)}
                    </Heading>
                    <div className={styles.ikonContainer}>
                        {erStønadsperiodeUtløpt || kanGjenopptas ? (
                            <>
                                <WarningIcon />
                                <BodyShort>
                                    {formatMessage(
                                        kanGjenopptas
                                            ? 'utbetalinger.stønadsperiode.stoppet'
                                            : 'utbetalinger.stønadsperiode.utløpt',
                                    )}
                                </BodyShort>
                            </>
                        ) : (
                            <>
                                <SuccessIcon />
                                <BodyShort> {formatMessage('utbetalinger.stønadsperiode.aktiv')}</BodyShort>
                            </>
                        )}
                    </div>
                </div>
                <div className={styles.utbetalingContentContainer}>
                    <div>
                        <Heading level="4" size="small" spacing>
                            {formatMessage('utbetalinger.perioder.tittel')}
                        </Heading>
                        <Utbetalingsperioder utbetalingsperioder={utbetalingsperioder} />
                    </div>
                    <div className={styles.utbetalingKnappContainer}>
                        {kanGjenopptas && (
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => navigate(Routes.opprettGjenopptaRoute.createURL({ sakId: props.sakId }))}
                            >
                                {formatMessage('utbetalinger.stønadsperiode.knapp.gjenopptaUtbetaling')}
                            </Button>
                        )}
                        {kanStanses && (
                            <Button
                                variant="danger"
                                size="small"
                                onClick={() => navigate(Routes.stansOpprett.createURL({ sakId: props.sakId }))}
                            >
                                {formatMessage('utbetalinger.stønadsperiode.knapp.stoppUtbetaling')}
                            </Button>
                        )}
                    </div>
                </div>
            </Oppsummeringspanel>
        </div>
    );
};

export default Utbetalinger;
