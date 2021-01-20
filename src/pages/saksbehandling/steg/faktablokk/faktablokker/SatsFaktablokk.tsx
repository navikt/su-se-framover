import React from 'react';

import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { Ektefelle } from '~types/Behandlingsinformasjon';

import { setSatsFaktablokk } from '../../sats/utils';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

interface SatsProps extends FaktablokkProps {
    eps: Nullable<Ektefelle>;
}

const SatsFaktablokk = (props: SatsProps) => {
    const intl = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({
                id: 'display.fraSøknad',
            })}
            brukUndertittel={props.brukUndertittel}
            fakta={setSatsFaktablokk(props.søknadInnhold, intl, props.eps)}
        />
    );
};

export default SatsFaktablokk;
