import { CalendarProgressBar } from '../../../components/calendarProgressBar/CalendarProgressBar';
import React from 'react';
import '../saksoversikt.less';
import Kontrollsamtaler from './Kontrollsamtaler';
import Utbetalinger from './Utbetalinger';
import Dokumentasjon from './Dokumentasjon';
import { useSelector } from 'react-redux';

const Stønadsperiode = () => {
    const { saksoversiktReducer } = useSelector(state => state);
    const { saksoversikt } = saksoversiktReducer;

    const startDate = new Date(saksoversikt.aktivStønadsperiode.datoer.startDato);
    const todayDate = new Date();
    const endDate = new Date(saksoversikt.aktivStønadsperiode.datoer.sluttDato);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1em' }}>Sak-id: 555 088 322</p>
            </div>

            <div style={{ backgroundColor: 'rgb(233, 231, 231)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em' }}>
                    <CalendarProgressBar startPeriode={startDate} datoIDag={todayDate} sluttPeriode={endDate} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1em', marginTop: '1em' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <Kontrollsamtaler />
                        <Dokumentasjon />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <Utbetalinger />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stønadsperiode;
