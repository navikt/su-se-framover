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

    const stansEllerGjenopptaUtbetalingerStatus = useAppSelector((s) => s.sak.stansEllerGjenopptaUtbetalingerStatus);
    return (
        <div className={styles.container}>
            <ul className={styles.utbetalinger}>
                {sak.utbetalinger.map((u) => (
                    <li key={u.id}>
                        <Panel border>
                            <div>
                                <p>
                                    Fra og med:{' '}
                                    {DateFns.formatISO(DateFns.parseISO(u.fraOgMed), { representation: 'date' })}
                                </p>
                                <p>
                                    Til og med:{' '}
                                    {DateFns.formatISO(DateFns.parseISO(u.tilOgMed), { representation: 'date' })}
                                </p>
                                <p>Beløp: {u.beløp}</p>
                            </div>
                        </Panel>
                    </li>
                ))}
            </ul>
            <Knapp
                hidden={
                    // TODO jah: Vi skal legge til dette per utbetalingslinje i backend, slik at den følger den faktiske implementasjonen
                    // Tidligste utbetaling må være etter eller lik den første neste måned (nåværende backend impl).
                    sak.utbetalingerKanStansesEllerGjenopptas != KanStansesEllerGjenopptas.STANS ||
                    sak.utbetalinger.every((u) =>
                        DateFns.isBefore(
                            DateFns.parseISO(u.tilOgMed),
                            DateFns.startOfMonth(DateFns.addMonths(new Date(), 1))
                        )
                    )
                }
                onClick={async () => {
                    if (!RemoteData.isPending(stansEllerGjenopptaUtbetalingerStatus)) {
                        await dispatch(
                            sakSlice.stansUtbetalinger({
                                sakId: props.sak.id,
                            })
                        );
                    }
                }}
                spinner={RemoteData.isPending(stansEllerGjenopptaUtbetalingerStatus)}
                className={styles.stansUtbetalinger}
            >
                Stans utbetalinger
            </Knapp>
            <Knapp
                hidden={sak.utbetalingerKanStansesEllerGjenopptas != KanStansesEllerGjenopptas.GJENOPPTA}
                onClick={async () => {
                    if (!RemoteData.isPending(stansEllerGjenopptaUtbetalingerStatus)) {
                        await dispatch(
                            sakSlice.gjenopptaUtbetalinger({
                                sakId: props.sak.id,
                            })
                        );
                    }
                }}
                spinner={RemoteData.isPending(stansEllerGjenopptaUtbetalingerStatus)}
                className={styles.stansUtbetalinger}
            >
                Gjenoppta utbetalinger
            </Knapp>
            {RemoteData.isFailure(stansEllerGjenopptaUtbetalingerStatus) && (
                <AlertStripe type="feil">Klarte ikke stanse/gjenoppta utbetalingene.</AlertStripe>
            )}
            {RemoteData.isSuccess(stansEllerGjenopptaUtbetalingerStatus) && (
                <AlertStripe type="suksess">Utbetalingene er stanset/gjenopptatt.</AlertStripe>
            )}
        </div>
    );
};

export default Utbetalinger;
