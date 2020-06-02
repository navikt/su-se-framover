import { getRandomSmiley } from '../../../hooks/getRandomEmoji';
import React from 'react';

const Utbetaling = ({ datoForUtbetaling, beløp, status }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '0.5em' }}>
            <p>{datoForUtbetaling}</p>
            <p>{beløp}</p>
            <p>{status}</p>
        </div>
    );
};

const TidligereUtbetalinger = utbetalingerArray => {
    return (
        <div style={{ display: 'flex' }}>
            {getRandomSmiley()}
            <div style={{ marginLeft: '1em' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '1em' }}>
                    <p style={{ marginRight: '1em', fontWeight: 'bold' }}>Dato for Utbetaling</p>
                    <p style={{ fontWeight: 'bold' }}>Beløp</p>
                    <p style={{ fontWeight: 'bold' }}>Status</p>
                </div>
                {utbetalingerArray.map((utbetaling, idx) => (
                    <Utbetaling
                        key={idx}
                        datoForUtbetaling={utbetaling.datoForUtbetaling}
                        beløp={utbetaling.beløp}
                        status={utbetaling.status}
                    />
                ))}
            </div>
        </div>
    );
};

export default TidligereUtbetalinger;
