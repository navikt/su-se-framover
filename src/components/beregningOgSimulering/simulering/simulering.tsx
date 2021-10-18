import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading, Label, Loader } from '@navikt/ds-react';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import * as arr from 'fp-ts/Array';
import * as Option from 'fp-ts/Option';
import React from 'react';

import sharedMessages from '~components/beregningOgSimulering/beregning/beregning-nb';
import { combineOptions, pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import { useAppSelector } from '~redux/Store';
import { Behandling } from '~types/Behandling';
import { Simulering, SimulertUtbetalingstype } from '~types/Simulering';
import { groupWhile } from '~utils/array/arrayUtils';
import { formatMonthYear } from '~utils/date/dateUtils';
import { formatCurrency } from '~utils/format/formatUtils';

import styles from '../beregning/visBeregning.module.less';

import messages from './simulering-nb';

interface Props {
    behandling: Behandling;
}

export const Utbetalingssimulering = (props: { simulering: Simulering; utenTittel?: boolean }) => {
    const { intl } = useI18n({ messages: { ...sharedMessages, ...messages } });

    return (
        <div className={styles.simuleringsdetaljer}>
            {props.utenTittel && (
                <Heading level="4" size="medium" spacing>
                    {intl.formatMessage({ id: 'simulering.tittel' })}
                </Heading>
            )}
            <Label className={classNames(styles.totalt, styles.linje)}>
                <span>{intl.formatMessage({ id: 'totaltBeløp' })}</span>
                <span />
                <span className={styles.beløp}>
                    {formatCurrency(props.simulering.totalBruttoYtelse, {
                        numDecimals: 0,
                    })}
                </span>
            </Label>
            {pipe(
                props.simulering.perioder,
                groupWhile(
                    (curr, prev) =>
                        curr.bruttoYtelse === prev.bruttoYtelse &&
                        curr.type === prev.type &&
                        DateFns.differenceInCalendarMonths(
                            DateFns.parseISO(curr.fraOgMed),
                            DateFns.parseISO(prev.tilOgMed)
                        ) <= 1
                ),
                arr.map((gruppe) => {
                    return pipe(
                        combineOptions([arr.head(gruppe), arr.last(gruppe)]),
                        Option.map(([head, last]) => {
                            return (
                                <Heading
                                    level="5"
                                    size="xsmall"
                                    className={styles.linje}
                                    key={head.fraOgMed + head.tilOgMed}
                                    spacing
                                >
                                    <span className={styles.periode}>{`${formatMonthYear(
                                        head.fraOgMed
                                    )} - ${formatMonthYear(last.tilOgMed)}`}</span>
                                    <span className={styles.type}>
                                        {head.type !== SimulertUtbetalingstype.ORDINÆR
                                            ? intl.formatMessage({ id: simulertUtbetalingstypeToResourceId(head.type) })
                                            : ''}
                                    </span>
                                    <span className={styles.beløp}>
                                        {formatCurrency(head.bruttoYtelse, {
                                            numDecimals: 0,
                                        })}{' '}
                                        {intl.formatMessage({ id: 'iMnd' })}
                                    </span>
                                </Heading>
                            );
                        }),
                        Option.getOrElse(() => (
                            <Alert variant="warning">{intl.formatMessage({ id: 'feil.manglerPerioder' })}</Alert>
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
        return <Loader />;
    }
    if (!behandling.simulering) {
        return <div>Behandlingen har ingen simulering</div>;
    }
    return <Utbetalingssimulering simulering={behandling.simulering} />;
};
