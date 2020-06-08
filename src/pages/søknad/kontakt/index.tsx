import * as React from 'react';

import { Søknadsteg } from '../types';
import Bunnknapper from '../Bunnknapper';

const Kontakt = () => {
    return (
        <div>
            <Bunnknapper
                previous={{
                    label: 'forrige steg',
                    onClick: () => {
                        console.log('next');
                    },
                    steg: Søknadsteg.ReiseTilUtlandet
                }}
                next={{
                    label: 'neste steg',
                    onClick: () => {
                        console.log('next');
                    },
                    steg: Søknadsteg.Oppsummering
                }}
            />
        </div>
    );
};

export default Kontakt;
