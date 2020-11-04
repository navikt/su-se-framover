import * as RemoteData from '@devexperts/remote-data-ts';
import * as DateFns from 'date-fns';
import AlertStripe from 'nav-frontend-alertstriper';
import Ikon from 'nav-frontend-ikoner-assets';
import { Fareknapp, Flatknapp, Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import Panel from 'nav-frontend-paneler';
import { Element, Undertittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { FormattedDate, IntlShape } from 'react-intl';

import { Person } from '~api/personApi';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { KanStansesEllerGjenopptas } from '~types/Sak';
import { Utbetalingsperiode } from '~types/Utbetalingsperiode';

import messages from './utbetalinger-nb';
import styles from './utbetalinger.module.less';

import { rootId } from '~indexUtils';

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

    ModalWrapper.setAppElement(document.getElementById(rootId));

    // TODO jah: Vi skal legge til dette per utbetalingslinje i backend, slik at den følger den faktiske implementasjonen
    // Tidligste utbetaling må være etter eller lik den første neste måned (nåværende backend impl).
    const kanStanses =
        kanStansesEllerGjenopptas === KanStansesEllerGjenopptas.STANS &&
        utbetalingsperioder.some(
            (u) =>
                !DateFns.isBefore(DateFns.parseISO(u.tilOgMed), DateFns.startOfMonth(DateFns.addMonths(new Date(), 1)))
        );

    return (
        <div className={styles.utbetalingContainer}>
            <Undertittel className={styles.tittel}>
                {intl.formatMessage({ id: 'display.stønadsperioder.tittel' })}
            </Undertittel>
            <Panel border>
                <div className={styles.stønadsperiodeHeader}>
                    <Undertittel>
                        {<FormattedDate value={utbetalingsperioder[0].fraOgMed} month="2-digit" year="numeric" />} -{' '}
                        {
                            <FormattedDate
                                value={utbetalingsperioder[utbetalingsperioder.length - 1].tilOgMed}
                                month="2-digit"
                                year="numeric"
                            />
                        }
                    </Undertittel>
                    {kanStanses ? (
                        <div className={styles.ikonContainer}>
                            <Ikon className={styles.ikon} kind="ok-sirkel-fyll" width={'24px'} />
                            <p> {intl.formatMessage({ id: 'display.stønadsperioder.aktiv' })}</p>
                        </div>
                    ) : (
                        <div className={styles.ikonContainer}>
                            <Ikon className={styles.ikon} kind="advarsel-sirkel-fyll" width={'24px'} />
                            <p> {intl.formatMessage({ id: 'display.stønadsperioder.stoppet' })}</p>
                        </div>
                    )}
                </div>
                <div className={styles.utbetalingsperioderContainer}>
                    <div>
                        <Element className={styles.utbetalingsperiodeTittel}>
                            {intl.formatMessage({ id: 'display.utbetalingsperiode.tittel' })}
                        </Element>
                        {utbetalingsperioder.map((u) => {
                            return <Utbetalingsperiode utbetalingsperiode={u} key={u.id} intl={intl} />;
                        })}
                    </div>
                    <div className={styles.utbetalingKnappContainer}>
                        {kanStanses ? (
                            <Fareknapp onClick={() => setModalOpen(true)}>
                                {intl.formatMessage({ id: 'display.utbetalingsperiode.stoppUtbetaling' })}
                            </Fareknapp>
                        ) : (
                            <Knapp
                                onClick={() => {
                                    if (
                                        props.kanStansesEllerGjenopptas === KanStansesEllerGjenopptas.GJENOPPTA &&
                                        !RemoteData.isPending(gjenopptaUtbetalingerStatus)
                                    ) {
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
                            {intl.formatMessage({ id: 'display.utbetalingsperiode.stansUtbetalingerTil' })}
                            {søker.navn.fornavn} {søker.navn.mellomnavn} {søker.navn.etternavn}
                        </Undertittel>
                        <p>{intl.formatMessage({ id: 'display.utbetalingsperiode.bekreftStans' })}</p>
                        <div className={styles.modalKnappContainer}>
                            <Flatknapp
                                onClick={() => setModalOpen(false)}
                                spinner={RemoteData.isPending(stansUtbetalingerStatus)}
                            >
                                {intl.formatMessage({ id: 'display.utbetalingsperiode.avbryt' })}
                            </Flatknapp>
                            <Fareknapp
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
                    <AlertStripe type="suksess">
                        {intl.formatMessage({ id: 'display.utbetalingsperiode.gjenopptattUtbetaling' })}
                    </AlertStripe>
                )}
            </Panel>
        </div>
    );
};

const Utbetalingsperiode = (props: { utbetalingsperiode: Utbetalingsperiode; intl: IntlShape }) => {
    return (
        <div className={styles.utbetalingsperiode}>
            <p>
                {<FormattedDate value={props.utbetalingsperiode.fraOgMed} month="2-digit" year="numeric" />} -{' '}
                {<FormattedDate value={props.utbetalingsperiode.tilOgMed} month="2-digit" year="numeric" />}
            </p>
            <p>{props.utbetalingsperiode.beløp} kr</p>
            <p>{props.intl.formatMessage({ id: 'display.utbetalingsperiode.ordinærSats' })}</p>
        </div>
    );
};

export default Utbetalinger;
