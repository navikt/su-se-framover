import React from 'react';

import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';

import { EPSMedAlder, setSatsFaktablokk } from '../../sats/utils';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

interface SatsProps extends FaktablokkProps {
    eps: Nullable<EPSMedAlder>;
}

const SatsFaktablokk = (props: SatsProps) => {
    const intl = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({
                id: 'display.fraSøknad',
            })}
            tittelType={props.tittelType}
            fakta={setSatsFaktablokk(props.søknadInnhold, intl, props.eps)}
        />
    );
};

export default SatsFaktablokk;
