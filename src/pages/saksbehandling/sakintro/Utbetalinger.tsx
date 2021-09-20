import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import Ikon from 'nav-frontend-ikoner-assets';
import { Fareknapp, Flatknapp, Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import Panel from 'nav-frontend-paneler';
import { Element, Undertittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Person } from '~api/personApi';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { KanStansesEllerGjenopptas } from '~types/Sak';
import { compareUtbetalingsperiode, Utbetalingsperiode, Utbetalingstype } from '~types/Utbetalingsperiode';
import { formatMonthYear } from '~utils/date/dateUtils';
import { showName } from '~utils/person/personUtils';

import messages from './utbetalinger-nb';
import styles from './utbetalinger.module.less';

export const Utbetalinger = (props: {
    søker: Person;
    sakId: string;
    utbetalingsperioder: Utbetalingsperiode[];
    kanStansesEllerGjenopptas: KanStansesEllerGjenopptas;
}) => {
    const { intl } = useI18n({ messages });
    const dispatch = useAppDispatch();
    const history = useHistory();
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

    const sortertUtbetalingsperioder = [...props.utbetalingsperioder].sort(compareUtbetalingsperiode);
    const sisteUtbetalingsDato = new Date(sortertUtbetalingsperioder[sortertUtbetalingsperioder.length - 1].tilOgMed);

    return (
        <div className={styles.utbetalingContainer}>
            <Undertittel className={styles.tittel}>
                {intl.formatMessage({ id: 'display.stønadsperioder.tittel' })}
            </Undertittel>
            <Panel border>
                <div className={styles.stønadsperiodeHeader}>
                    <Undertittel>
                        {intl.formatDate(utbetalingsperioder[0].fraOgMed, { month: '2-digit', year: 'numeric' })} -{' '}
                        {formatMonthYear(sisteUtbetalingsDato.toString())}
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
                                    <li key={`${u.fraOgMed}-${u.tilOgMed}-${u.type}`}>
                                        <UtbetalingsperiodeListItem utbetalingsperiode={u} intl={intl} />
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                    <div className={styles.utbetalingKnappContainer}>
                        {kanGjenopptas ? (
                            <Knapp
                                onClick={() =>
                                    history.push(Routes.gjenopptaStansRoute.createURL({ sakId: props.sakId }))
                                }
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
                            <Alert variant="error">
                                {intl.formatMessage({ id: 'display.utbetalingsperiode.klarteIkkeStanseUtbetaling' })}
                            </Alert>
                        )}
                        {RemoteData.isSuccess(stansUtbetalingerStatus) && (
                            <Alert variant="success">
                                {intl.formatMessage({ id: 'display.utbetalingsperiode.stansetUtbetaling' })}
                            </Alert>
                        )}
                    </div>
                </ModalWrapper>
                {RemoteData.isFailure(gjenopptaUtbetalingerStatus) && (
                    <Alert variant="error">
                        {intl.formatMessage({ id: 'display.utbetalingsperiode.klarteIkkeGjenopptaUtbetaling' })}
                    </Alert>
                )}
                {RemoteData.isSuccess(gjenopptaUtbetalingerStatus) && (
                    <Alert variant="success" className={styles.utbetalingGjenopptatt}>
                        {intl.formatMessage({ id: 'display.utbetalingsperiode.gjenopptattUtbetaling' })}
                    </Alert>
                )}
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
