import React from 'react';

import { useI18n } from '~lib/hooks';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

const FlyktningFaktablokk = (props: FaktablokkProps) => {
    const intl = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            brukUndertittel={props.brukUndertittel}
            fakta={[
                {
                    tittel: intl.formatMessage({ id: 'flyktning.registrertFlyktning' }),
                    verdi: props.søknadInnhold.flyktningsstatus.registrertFlyktning
                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                        : intl.formatMessage({ id: 'fraSøknad.nei' }),
                },
            ]}
        />
    );
};

export default FlyktningFaktablokk;
