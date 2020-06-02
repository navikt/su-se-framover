import { getRandomSmiley } from '../../../hooks/getRandomEmoji';
import React from 'react';

const TidligereKontrollsamtaler = kontrollsamtalerArray => {
    return (
        <div style={{ display: 'flex' }}>
            {getRandomSmiley()}
            <div style={{ marginLeft: '1em' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '1em' }}>
                    <p style={{ marginRight: '1em', fontWeight: 'bold' }}>Kontrollsamtaler</p>
                </div>
                {kontrollsamtalerArray.map((kontrollsamtale, idx) => (
                    <p key={idx} style={{ marginBottom: '1em' }}>
                        {kontrollsamtale}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default TidligereKontrollsamtaler;
