import * as React from 'react';

import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import messages from './kontakt-nb'
import TextProvider, { Languages } from '~components/TextProvider';
import { FormattedMessage } from 'react-intl';

const Kontakt = () => {
    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div>
                <Bunnknapper
                    previous={{
                        label: <FormattedMessage id="steg.forrige" />,
                        onClick: () => {
                            console.log('next');
                        },
                        steg: Søknadsteg.ReiseTilUtlandet
                    }}
                    next={{
                        label: <FormattedMessage id="steg.neste" />,
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
