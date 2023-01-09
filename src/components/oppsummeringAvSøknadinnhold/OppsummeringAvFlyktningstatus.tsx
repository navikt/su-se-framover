import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Flyktningstatus } from '~src/types/Søknadinnhold';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './OppsummeringAvSøknadinnhold-nb';

const OppsummeringAvFlyktningstatus = (props: { flyktningstatus: Flyktningstatus }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <OppsummeringPar
                label={formatMessage('flyktning.registrertSomFlyktning')}
                verdi={formatMessage(`bool.${props.flyktningstatus.registrertFlyktning}`)}
            />
        </div>
    );
};

export default OppsummeringAvFlyktningstatus;
