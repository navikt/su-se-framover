import { Button, Heading, Panel } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import Ikon from 'nav-frontend-ikoner-assets';
import React from 'react';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { KanStansesEllerGjenopptas } from '~types/Sak';
import { compareUtbetalingsperiode, Utbetalingsperiode, Utbetalingstype } from '~types/Utbetalingsperiode';
import { formatMonthYear } from '~utils/date/dateUtils';

import messages from './utbetalinger-nb';
import styles from './utbetalinger.module.less';

export const Utbetalinger = (props: {
    sakId: string;
    utbetalingsperioder: Utbetalingsperiode[];
    kanStansesEllerGjenopptas: KanStansesEllerGjenopptas;
}) => {
    const { intl } = useI18n({ messages });
    const history = useHistory();
    const { utbetalingsperioder, kanStansesEllerGjenopptas } = props;

    if (utbetalingsperioder.length === 0) {
        return <div></div>;
    }

    // TODO jah: Vi skal legge til dette per utbetalingslinje i backend, slik at den følger den faktiske implementasjonen
    // Tidligste utbetaling må være etter eller lik den første neste måned (nåværende backend impl).
    const kanStanses =
        kanStansesEllerGjenopptas === KanStansesEllerGjenopptas.STANS &&
        utbetalingsperioder.some(
            (u) =>
                !DateFns.isBefore(DateFns.parseISO(u.tilOgMed), DateFns.startOfMonth(DateFns.addMonths(new Date(), 1)))
        );

    const kanGjenopptas = kanStansesEllerGjenopptas === KanStansesEllerGjenopptas.GJENOPPTA;

    const sortertUtbetalingsperioder = [...props.utbetalingsperioder].sort(compareUtbetalingsperiode);
    const sisteUtbetalingsDato = new Date(sortertUtbetalingsperioder[sortertUtbetalingsperioder.length - 1].tilOgMed);

    return (
        <div className={styles.utbetalingContainer}>
            <Heading level="2" size="medium" spacing>
                {intl.formatMessage({ id: 'display.stønadsperioder.tittel' })}
            </Heading>
            <Panel border>
                <div className={styles.stønadsperiodeHeader}>
                    <Heading level="3" size="small" spacing>
                        {intl.formatDate(utbetalingsperioder[0].fraOgMed, { month: '2-digit', year: 'numeric' })} -{' '}
                        {formatMonthYear(sisteUtbetalingsDato.toString())}
                    </Heading>
                    {kanGjenopptas ? (
                        <div className={styles.ikonContainer}>
                            <Ikon className={styles.ikon} kind="advarsel-sirkel-fyll" width={'24px'} />
                            <p> {intl.formatMessage({ id: 'display.stønadsperioder.stoppet' })}</p>
                        </div>
                    ) : (
                        <div className={styles.ikonContainer}>
                            <Ikon className={styles.ikon} kind="ok-sirkel-fyll" width={'24px'} />
                            <p> {intl.formatMessage({ id: 'display.stønadsperioder.aktiv' })}</p>
                        </div>
                    )}
                </div>
                <div className={styles.utbetalingsperioderContainer}>
                    <div>
                        <Heading level="4" size="small" spacing>
                            {intl.formatMessage({ id: 'display.utbetalingsperiode.tittel' })}
                        </Heading>
                        <ol>
                            {utbetalingsperioder.map((u) => {
                                return (
                                    <li key={`${u.fraOgMed}-${u.tilOgMed}-${u.type}`}>
                                        <UtbetalingsperiodeListItem utbetalingsperiode={u} intl={intl} />
                                    </li>
                                );
                            })}
                        </ol>
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
                                {intl.formatMessage({ id: 'display.utbetalingsperiode.gjenopptaUtbetaling' })}
                            </Button>
                        ) : (
                            kanStanses && (
                                <Button
                                    variant="danger"
                                    size="small"
                                    onClick={() => history.push(Routes.stansRoute.createURL({ sakId: props.sakId }))}
                                >
                                    {intl.formatMessage({ id: 'display.utbetalingsperiode.stoppUtbetaling' })}
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </Panel>
        </div>
    );
};

const utbetalingstypeTilTekst = (utbetalingstype: Utbetalingstype, intl: IntlShape) => {
    switch (utbetalingstype) {
        case Utbetalingstype.NY:
            return '';
        case Utbetalingstype.OPPHØR:
            return intl.formatMessage({ id: 'display.utbetalingsperiode.linje.opphørt' });
    }
};

const UtbetalingsperiodeListItem = (props: { utbetalingsperiode: Utbetalingsperiode; intl: IntlShape }) => {
    return (
        <div className={styles.utbetalingsperiode}>
            <p>
                {props.intl.formatDate(props.utbetalingsperiode.fraOgMed, { month: '2-digit', year: 'numeric' })} -{' '}
                {props.intl.formatDate(props.utbetalingsperiode.tilOgMed, { month: '2-digit', year: 'numeric' })}
            </p>
            <p>{props.utbetalingsperiode.beløp} kr</p>
            <p>{utbetalingstypeTilTekst(props.utbetalingsperiode.type, props.intl)}</p>
        </div>
    );
};

export default Utbetalinger;
