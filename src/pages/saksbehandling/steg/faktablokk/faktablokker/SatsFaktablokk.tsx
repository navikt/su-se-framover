import React from 'react';

import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { SøknadInnhold } from '~types/Søknad';

import { EPSMedAlder, setSatsFaktablokk } from '../../sats/utils';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

const SatsFaktablokk = (props: { søknadInnhold: SøknadInnhold; eps: Nullable<EPSMedAlder> }) => {
    const intl = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({
                id: 'display.fraSøknad',
            })}
            fakta={setSatsFaktablokk(props.søknadInnhold, intl, props.eps)}
        />
    );
};

export default SatsFaktablokk;
