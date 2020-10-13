import * as RemoteData from '@devexperts/remote-data-ts';
import * as DateFns from 'date-fns';
import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import React from 'react';

import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { KanStansesEllerGjenopptas, Sak } from '~types/Sak';

import styles from './utbetalinger.module.less';

const Utbetalinger = (props: { sak: Sak }) => {
    const { sak } = props;
    const dispatch = useAppDispatch();

    const { stansUtbetalingerStatus, gjenopptaUtbetalingerStatus } = useAppSelector((s) => s.sak);

    return (
        <div className={styles.container}>
            <ul className={styles.utbetalinger}>
                {sak.utbetalinger.map((u) => (
                    <li key={u.id}>
                        <Panel border>
                            <div>
                                <p>Fra og med: {u.fraOgMed}</p>
                                <p>Til og med: {u.tilOgMed}</p>
                                <p>Beløp: {u.beløp}</p>
                                <p>Type: {u.type}</p>
                            </div>
                        </Panel>
                    </li>
                ))}
            </ul>
            {
                // TODO jah: Vi skal legge til dette per utbetalingslinje i backend, slik at den følger den faktiske implementasjonen
                // Tidligste utbetaling må være etter eller lik den første neste måned (nåværende backend impl).
                sak.utbetalingerKanStansesEllerGjenopptas === KanStansesEllerGjenopptas.STANS &&
                    sak.utbetalinger.some(
                        (u) =>
                            !DateFns.isBefore(
                                DateFns.parseISO(u.tilOgMed),
                                DateFns.startOfMonth(DateFns.addMonths(new Date(), 1))
                            )
                    ) && (
                        <Knapp
                            onClick={() => {
                                if (!RemoteData.isPending(stansUtbetalingerStatus)) {
                                    dispatch(
                                        sakSlice.stansUtbetalinger({
                                            sakId: props.sak.id,
                                        })
                                    );
                                }
                            }}
                            spinner={RemoteData.isPending(stansUtbetalingerStatus)}
                            className={styles.stansUtbetalinger}
                        >
                            Stans utbetalinger
                        </Knapp>
                    )
            }
            {sak.utbetalingerKanStansesEllerGjenopptas === KanStansesEllerGjenopptas.GJENOPPTA && (
                <Knapp
                    onClick={() => {
                        if (!RemoteData.isPending(gjenopptaUtbetalingerStatus)) {
                            dispatch(
                                sakSlice.gjenopptaUtbetalinger({
                                    sakId: props.sak.id,
                                })
                            );
                        }
                    }}
                    spinner={RemoteData.isPending(gjenopptaUtbetalingerStatus)}
                    className={styles.stansUtbetalinger}
                >
                    Gjenoppta utbetalinger
                </Knapp>
            )}
            {RemoteData.isFailure(stansUtbetalingerStatus) && (
                <AlertStripe type="feil">Klarte ikke stanse utbetalingene.</AlertStripe>
            )}
            {RemoteData.isSuccess(stansUtbetalingerStatus) && (
                <AlertStripe type="suksess">Utbetalingene er stanset.</AlertStripe>
            )}
            {RemoteData.isFailure(gjenopptaUtbetalingerStatus) && (
                <AlertStripe type="feil">Klarte ikke gjenoppta utbetalingene.</AlertStripe>
            )}
            {RemoteData.isSuccess(gjenopptaUtbetalingerStatus) && (
                <AlertStripe type="suksess">Utbetalingene er gjenopptatt.</AlertStripe>
            )}
        </div>
    );
};

export default Utbetalinger;
