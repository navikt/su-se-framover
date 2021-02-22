import * as RemoteData from '@devexperts/remote-data-ts';
import * as DateFns from 'date-fns';
import AlertStripe from 'nav-frontend-alertstriper';
import Ikon from 'nav-frontend-ikoner-assets';
import { Fareknapp, Flatknapp, Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import Panel from 'nav-frontend-paneler';
import { Element, Undertittel } from 'nav-frontend-typografi';
import React, { useState, useMemo } from 'react';
import { IntlShape } from 'react-intl';

import { Person } from '~api/personApi';
import { showName } from '~features/person/personUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { formatMonthYear } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { KanStansesEllerGjenopptas } from '~types/Sak';
import { Utbetalingsperiode } from '~types/Utbetalingsperiode';

import messages from './utbetalinger-nb';
import styles from './utbetalinger.module.less';

const sorterUtbetalingsperioder = (
    utbetalingsperioder: Utbetalingsperiode[],
    sortFn: (dateLeft: number | Date, dateRight: number | Date) => number
): Date[] => {
    return utbetalingsperioder.map((u) => new Date(u.tilOgMed)).sort(sortFn);
};
export const finnSisteUtbetalingsdato = (utbetalingsperioder: Utbetalingsperiode[]) => {
    return sorterUtbetalingsperioder(utbetalingsperioder, DateFns.compareDesc)[0];
};

export const finnFørsteUtbetalingsdato = (utbetalingsperioder: Utbetalingsperiode[]) => {
    return sorterUtbetalingsperioder(utbetalingsperioder, DateFns.compareAsc)[0];
};

export const Utbetalinger = (props: {
    søker: Person;
    sakId: string;
    utbetalingsperioder: Utbetalingsperiode[];
    kanStansesEllerGjenopptas: KanStansesEllerGjenopptas;
}) => {
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();
    const { utbetalingsperioder, kanStansesEllerGjenopptas, søker } = props;
    const { stansUtbetalingerStatus, gjenopptaUtbetalingerStatus } = useAppSelector((s) => s.sak);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

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

    const sisteUtbetalingsDato = useMemo<Date>(() => finnSisteUtbetalingsdato(utbetalingsperioder), [
        utbetalingsperioder,
    ]);

    return (
        <div className={styles.utbetalingContainer}>
            <Undertittel className={styles.tittel}>
                {intl.formatMessage({ id: 'display.stønadsperioder.tittel' })}
            </Undertittel>
            <Panel border>
                <div className={styles.stønadsperiodeHeader}>
                    <Undertittel>
                        {intl.formatDate(utbetalingsperioder[0].fraOgMed, { month: '2-digit', year: 'numeric' })} -{' '}
                        {formatMonthYear(sisteUtbetalingsDato.toString(), intl)}
                    </Undertittel>
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
                        <Element className={styles.utbetalingsperiodeTittel}>
                            {intl.formatMessage({ id: 'display.utbetalingsperiode.tittel' })}
                        </Element>
                        <ol>
                            {utbetalingsperioder.map((u) => {
                                return (
                                    <li key={u.id}>
                                        <UtbetalingsperiodeListItem utbetalingsperiode={u} intl={intl} />
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                    <div className={styles.utbetalingKnappContainer}>
                        {kanGjenopptas ? (
                            <Knapp
                                onClick={() => {
                                    if (kanGjenopptas && !RemoteData.isPending(gjenopptaUtbetalingerStatus)) {
                                        dispatch(
                                            sakSlice.gjenopptaUtbetalinger({
                                                sakId: props.sakId,
                                            })
                                        );
                                    }
                                }}
                                spinner={RemoteData.isPending(gjenopptaUtbetalingerStatus)}
                            >
                                {intl.formatMessage({ id: 'display.utbetalingsperiode.gjenopptaUtbetaling' })}
                            </Knapp>
                        ) : (
                            kanStanses && (
                                <Fareknapp onClick={() => setModalOpen(true)}>
                                    {intl.formatMessage({ id: 'display.utbetalingsperiode.stoppUtbetaling' })}
                                </Fareknapp>
                            )
                        )}
                    </div>
                </div>
                <ModalWrapper
                    isOpen={modalOpen}
                    closeButton={true}
                    onRequestClose={() => setModalOpen(false)}
                    contentLabel={'stansUtbetalinger'}
                >
                    <div className={styles.modalContainer}>
                        <Undertittel>
                            {intl.formatMessage({ id: 'display.utbetalingsperiode.stansUtbetalingerTil' })}{' '}
                            {showName(søker.navn)}
                        </Undertittel>
                        <p>{intl.formatMessage({ id: 'display.utbetalingsperiode.bekreftStans' })}</p>
                        <div className={styles.modalKnappContainer}>
                            <Flatknapp onClick={() => setModalOpen(false)}>
                                {intl.formatMessage({ id: 'display.utbetalingsperiode.avbryt' })}
                            </Flatknapp>
                            <Fareknapp
                                spinner={RemoteData.isPending(stansUtbetalingerStatus)}
                                onClick={() => {
                                    if (kanStanses && !RemoteData.isPending(stansUtbetalingerStatus)) {
                                        dispatch(
                                            sakSlice.stansUtbetalinger({
                                                sakId: props.sakId,
                                            })
                                        );
                                    }
                                }}
                            >
                                {intl.formatMessage({ id: 'display.utbetalingsperiode.stansUtbetaling' })}
                            </Fareknapp>
                        </div>
                        {RemoteData.isFailure(stansUtbetalingerStatus) && (
                            <AlertStripe type="feil">
                                {intl.formatMessage({ id: 'display.utbetalingsperiode.klarteIkkeStanseUtbetaling' })}
                            </AlertStripe>
                        )}
                        {RemoteData.isSuccess(stansUtbetalingerStatus) && (
                            <AlertStripe type="suksess">
                                {intl.formatMessage({ id: 'display.utbetalingsperiode.stansetUtbetaling' })}
                            </AlertStripe>
                        )}
                    </div>
                </ModalWrapper>
                {RemoteData.isFailure(gjenopptaUtbetalingerStatus) && (
                    <AlertStripe type="feil">
                        {intl.formatMessage({ id: 'display.utbetalingsperiode.klarteIkkeGjenopptaUtbetaling' })}
                    </AlertStripe>
                )}
                {RemoteData.isSuccess(gjenopptaUtbetalingerStatus) && (
                    <AlertStripe type="suksess" className={styles.utbetalingGjenopptatt}>
                        {intl.formatMessage({ id: 'display.utbetalingsperiode.gjenopptattUtbetaling' })}
                    </AlertStripe>
                )}
            </Panel>
        </div>
    );
};

const UtbetalingsperiodeListItem = (props: { utbetalingsperiode: Utbetalingsperiode; intl: IntlShape }) => {
    return (
        <div className={styles.utbetalingsperiode}>
            <p>
                {props.intl.formatDate(props.utbetalingsperiode.fraOgMed, { month: '2-digit', year: 'numeric' })} -{' '}
                {props.intl.formatDate(props.utbetalingsperiode.tilOgMed, { month: '2-digit', year: 'numeric' })}
            </p>
            <p>{props.utbetalingsperiode.beløp} kr</p>
            <p>{props.intl.formatMessage({ id: 'display.utbetalingsperiode.ordinærSats' })}</p>
        </div>
    );
};

export default Utbetalinger;
