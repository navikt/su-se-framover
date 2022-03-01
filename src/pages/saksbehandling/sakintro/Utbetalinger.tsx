import { Button, Heading, Panel } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { SuccessIcon, WarningIcon } from '~components/icons/Icons';
import { DateFormats, useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { KanStansesEllerGjenopptas } from '~types/Sak';
import { compareUtbetalingsperiode, Utbetalingsperiode } from '~types/Utbetalingsperiode';

import messages from './utbetalinger-nb';
import styles from './utbetalinger.module.less';

export const Utbetalinger = (props: {
    sakId: string;
    utbetalingsperioder: Utbetalingsperiode[];
    kanStansesEllerGjenopptas: KanStansesEllerGjenopptas;
}) => {
    const { formatMessage, formatDate } = useI18n({ messages });
    const history = useHistory();
    const { utbetalingsperioder, kanStansesEllerGjenopptas } = props;

    if (utbetalingsperioder.length === 0) {
        return <div></div>;
    }

    const sortertUtbetalingsperioder = [...props.utbetalingsperioder].sort(compareUtbetalingsperiode);
    const sisteUtbetalingsDato = new Date(sortertUtbetalingsperioder[sortertUtbetalingsperioder.length - 1].tilOgMed);

    // TODO jah: Vi skal legge til dette per utbetalingslinje i backend, slik at den følger den faktiske implementasjonen
    // Tidligste utbetaling må være etter eller lik den første neste måned (nåværende backend impl).
    const kanStanses =
        kanStansesEllerGjenopptas === KanStansesEllerGjenopptas.STANS &&
        utbetalingsperioder.some(
            (u) =>
                !DateFns.isBefore(DateFns.parseISO(u.tilOgMed), DateFns.startOfMonth(DateFns.addMonths(new Date(), 1)))
        );
    const kanGjenopptas = kanStansesEllerGjenopptas === KanStansesEllerGjenopptas.GJENOPPTA;

    const erStønadsperiodeUtløpt = DateFns.isAfter(new Date(), sisteUtbetalingsDato);

    return (
        <div className={styles.utbetalingContainer}>
            <Heading level="2" size="medium" spacing>
                {formatMessage('display.stønadsperioder.tittel')}
            </Heading>
            <Panel border>
                <div className={styles.stønadsperiodeHeader}>
                    <Heading level="3" size="small" spacing>
                        {formatDate(utbetalingsperioder[0].fraOgMed, DateFormats.MONTH_YEAR)} -{' '}
                        {formatDate(sisteUtbetalingsDato, DateFormats.MONTH_YEAR)}
                    </Heading>
                    {erStønadsperiodeUtløpt || kanGjenopptas ? (
                        <div className={styles.ikonContainer}>
                            <WarningIcon className={styles.ikon} />
                            <p>
                                {formatMessage(
                                    kanGjenopptas ? 'display.stønadsperioder.stoppet' : 'display.stønadsperioder.utløpt'
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className={styles.ikonContainer}>
                            <SuccessIcon className={styles.ikon} />
                            <p> {formatMessage('display.stønadsperioder.aktiv')}</p>
                        </div>
                    )}
                </div>
                <div className={styles.utbetalingsperioderContainer}>
                    <div>
                        <Heading level="4" size="small" spacing>
                            {formatMessage('display.utbetalingsperiode.tittel')}
                        </Heading>
                        <Utbetalingsperioder utbetalingsperioder={utbetalingsperioder} />
                    </div>
                    <div className={styles.utbetalingKnappContainer}>
                        {kanGjenopptas ? (
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() =>
                                    history.push(Routes.gjenopptaStansRoute.createURL({ sakId: props.sakId }))
                                }
                            >
                                {formatMessage('display.utbetalingsperiode.gjenopptaUtbetaling')}
                            </Button>
                        ) : (
                            kanStanses && (
                                <Button
                                    variant="danger"
                                    size="small"
                                    onClick={() => history.push(Routes.stansRoute.createURL({ sakId: props.sakId }))}
                                >
                                    {formatMessage('display.utbetalingsperiode.stoppUtbetaling')}
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </Panel>
        </div>
    );
};

const Utbetalingsperioder = (props: { utbetalingsperioder: Utbetalingsperiode[] }) => {
    const { formatMessage, formatDate } = useI18n({ messages });
    return (
        <ol>
            {props.utbetalingsperioder.map((u) => (
                <li key={`${u.fraOgMed}-${u.tilOgMed}-${u.type}`}>
                    <div className={styles.utbetalingsperiode}>
                        <p>
                            {formatDate(u.fraOgMed, DateFormats.MONTH_YEAR)} -{' '}
                            {formatDate(u.tilOgMed, DateFormats.MONTH_YEAR)}
                        </p>
                        <p>
                            {u.beløp} {formatMessage('display.utbetalingsperiode.beløp.kr')}
                        </p>
                        <p>{formatMessage(u.type)}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
};

export default Utbetalinger;
