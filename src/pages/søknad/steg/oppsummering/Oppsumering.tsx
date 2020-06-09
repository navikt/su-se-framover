import * as React from 'react';

import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';

const Oppsummering = () => {
    return (
        <div>
            <Bunnknapper
                previous={{
                    label: 'forrige steg',
                    onClick: () => { console.log('previous') },
                    steg: Søknadsteg.Kontakt
                }}
                next={{
                    label: 'neste steg',
                    onClick: () => { console.log('next') },
                    steg: Søknadsteg.LastOppDokumentasjon
                }}
            />
        </div>
    );
};

export default Oppsummering;
