import * as React from 'react';

import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import messages from './kontakt-nb'
import TextProvider, { Languages } from '~components/TextProvider';

const Kontakt = () => {
    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div>
                <Bunnknapper
                    previous={{
                        onClick: () => {
                            console.log('next');
                        },
                        steg: Søknadsteg.ReiseTilUtlandet
                    }}
                    next={{
                        onClick: () => {
                            console.log('next');
                        },
                        steg: Søknadsteg.Oppsummering
                    }}
                />
            </div>
        </TextProvider>
    );
};

export default Kontakt;
