import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Systemtittel, Element } from 'nav-frontend-typografi';
import React from 'react';

import { groupWhile } from '~lib/arrayUtils';
import { formatMonthYear } from '~lib/dateUtils';
import { formatCurrency } from '~lib/formatUtils';
import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import sharedMessages from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregning-nb';
import { useAppSelector } from '~redux/Store';
import { Behandling } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Simulering, SimulertUtbetalingstype } from '~types/Simulering';

import styles from '../beregning/visBeregning.module.less';

import messages from './simulering-nb';

interface Props {
    sak: Sak;
    behandling: Behandling;
}

export const Utbetalingssimulering = (props: { simulering: Simulering }) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });

    return (
        <div className={styles.simuleringsdetaljer}>
            <Systemtittel className={styles.visBeregningTittel}>
                {intl.formatMessage({ id: 'simulering.tittel' })}
            </Systemtittel>
            <Element className={classNames(styles.totalt, styles.linje)}>
                <span>{intl.formatMessage({ id: 'totaltBeløp' })}</span>
                <span />
                <span className={styles.beløp}>
                    {formatCurrency(intl, props.simulering.totalBruttoYtelse, {
                        numDecimals: 0,
                    })}
                </span>
            </Element>
            {pipe(
                props.simulering.perioder,
                groupWhile(
                    (curr, prev) =>
                        curr.bruttoYtelse === prev.bruttoYtelse &&
                        DateFns.differenceInCalendarMonths(
                            DateFns.parseISO(curr.fraOgMed),
                            DateFns.parseISO(prev.tilOgMed)
                        ) <= 1
                ),
                arr.map((gruppe) => {
                    return pipe(
                        combineOptions(arr.head(gruppe), arr.last(gruppe)),
                        Option.map(([head, last]) => {
                            return (
                                <Element
                                    tag="h3"
                                    className={classNames(styles.periodeoverskrift, styles.linje)}
                                    key={head.fraOgMed + head.tilOgMed}
                                >
                                    <span>{`${formatMonthYear(head.fraOgMed, intl)} - ${formatMonthYear(
                                        last.tilOgMed,
                                        intl
                                    )}`}</span>
                                    <span className={styles.type}>
                                        {head.type !== SimulertUtbetalingstype.ORDINÆR
                                            ? intl.formatMessage({ id: simulertUtbetalingstypeToResourceId(head.type) })
                                            : ''}
                                    </span>
                                    <span className={styles.beløp}>
                                        {formatCurrency(intl, head.bruttoYtelse, {
                                            numDecimals: 0,
                                        })}{' '}
                                        {intl.formatMessage({ id: 'iMnd' })}
                                    </span>
                                </Element>
                            );
                        }),
                        Option.getOrElse(() => (
                            <AlertStripeAdvarsel>
                                {intl.formatMessage({ id: 'feil.manglerPerioder' })}
                            </AlertStripeAdvarsel>
                        ))
                    );
                })
            )}
        </div>
    );
};

const simulertUtbetalingstypeToResourceId = (type: SimulertUtbetalingstype) => {
    switch (type) {
        case SimulertUtbetalingstype.ORDINÆR:
            return 'simulertUtbetalingstype.ordinær';
        case SimulertUtbetalingstype.ETTERBETALING:
            return 'simulertUtbetalingstype.etterbetaling';
        case SimulertUtbetalingstype.FEILUTBETALING:
            return 'simulertUtbetalingstype.feilutbetaling';
        case SimulertUtbetalingstype.UENDRET:
            return 'simulertUtbetalingstype.uendret';
        case SimulertUtbetalingstype.INGEN_UTBETALING:
            return 'simulertUtbetalingstype.ingenUtbetaling';
    }
};

export const VisSimulering = (props: Props) => {
    const { behandling } = props;

    const simuleringStatus = useAppSelector((s) => s.sak.simuleringStatus);
    if (RemoteData.isFailure(simuleringStatus)) {
        return <div>Feilet mens vi hentet oppdrag/simulering</div>;
    } else if (RemoteData.isPending(simuleringStatus)) {
        return <NavFrontendSpinner />;
    }
    if (!behandling.simulering) {
        return <div>Behandlingen har ingen simulering</div>;
    }
    return <Utbetalingssimulering simulering={behandling.simulering} />;
};
